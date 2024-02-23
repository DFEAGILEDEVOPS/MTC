import { type ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import moment from 'moment'
import { BlobService } from '../../azure/blob-service'
import * as mssql from 'mssql'
import config from '../../config'
import type { PsReportStagingCompleteMessage } from '../common/ps-report-service-bus-messages'

export class PsReportWriterService {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger
  private readonly logServiceName = 'PsReportWriterService'

  constructor (logger?: ILogger, sqlService?: ISqlService) {
    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger

    if (sqlService === undefined) {
      sqlService = new SqlService(this.logger)
    }
    this.sqlService = sqlService
  }

  /**
   *
   * @returns Create a new ps report table and return the table name
   */
  public async createDestinationTableAndView (): Promise<string> {
    const ds = moment().format('YYYY_MM_DDTHHmm')
    const newTableName = `psychometricReport_${ds}`
    const sql1 = `
      CREATE TABLE mtc_results.${newTableName} (
        PupilId int NOT NULL CONSTRAINT [PK_${newTableName}] PRIMARY KEY,
        PupilUPN nvarchar(32)  MASKED WITH (FUNCTION = 'default()') NOT NULL,
        createdAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_${newTableName}_createdAt] DEFAULT (getutcdate()),
        updatedAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_${newTableName}_updatedAt] DEFAULT (getutcdate()),
        DOB date MASKED WITH (FUNCTION = 'default()') NULL,
        Gender char(1) MASKED WITH (FUNCTION = 'default()') NULL,
        Forename nvarchar(128) MASKED WITH (FUNCTION = 'default()') NULL,
        Surname nvarchar(128) MASKED WITH (FUNCTION = 'default()') NULL,
        FormMark int MASKED WITH (FUNCTION = 'default()') NULL,
        QDisplayTime decimal(5,2) NULL,
        PauseLength decimal(5,2) NULL,
        AccessArr nvarchar(128) NULL,
        RestartReason smallint NULL,
        RestartNumber int NULL,
        PupilStatus nvarchar(32) NULL,
        DeviceId nvarchar(128) NULL,
        BrowserType nvarchar(128) NULL,
        SchoolName nvarchar(max) NULL,
        Estab smallint NULL,
        SchoolURN int NULL,
        LANum smallint NULL,
        AttemptId uniqueidentifier NULL,
        FormID nvarchar(64) NULL,
        TestDate date NULL,
        TimeStart datetimeoffset(7) NULL,
        TimeComplete datetimeoffset(7) NULL,
        TimeTaken decimal(9,3) NULL,
        ReasonNotTakingCheck char(1) NULL,
        ToECode int NULL,
        ImportedFromCensus bit NOT NULL CONSTRAINT [DF_${newTableName}_ImportedFromCensus] DEFAULT (0),
    `

    const sqlParts = []
    for (let n = 1; n <= 25; n++) {
      sqlParts.push(
        `Q${n}ID nvarchar(16) NULL,
         Q${n}Response nvarchar(60) NULL,
         Q${n}InputMethods nvarchar(16) NULL,
         Q${n}K nvarchar(max) NULL,
         Q${n}Sco tinyint NULL,
         Q${n}ResponseTime decimal(7,3) NULL,
         Q${n}TimeOut tinyint NULL,
         Q${n}TimeOutResponse tinyint NULL,
         Q${n}TimeOutSco tinyint NULL,
         Q${n}tLoad datetimeoffset(7) NULL,
         Q${n}tFirstKey datetimeoffset(7) NULL,
         Q${n}tLastKey datetimeoffset(7) NULL,
         Q${n}OverallTime decimal(7,3) NULL,
         Q${n}RecallTime decimal(7,3) NULL
       `
      )
    }
    const fullSql = sql1.concat(sqlParts.join(',\n'), ')')

    const triggerSql = `
      CREATE TRIGGER [mtc_results].[${newTableName}UpdatedAtTrigger]
          ON [mtc_results].[${newTableName}]
          FOR UPDATE AS
      BEGIN
          UPDATE [mtc_results].[${newTableName}]
            SET updatedAt = GETUTCDATE()
            FROM inserted
          WHERE [${newTableName}].PupilId = inserted.PupilId
      END;
    `

    const ix1Sql = `
      CREATE UNIQUE NONCLUSTERED INDEX IX_${newTableName}_AttemptId_unique ON mtc_results.[${newTableName}]
      (
        AttemptId ASC
      ) WHERE  ([AttemptId] IS NOT NULL) WITH ( PAD_INDEX = OFF,FILLFACTOR = 100,SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, STATISTICS_NORECOMPUTE = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON  ) ON [PRIMARY]
    `

    const ix2Sql = `
      CREATE UNIQUE NONCLUSTERED INDEX IX_${newTableName}_SchoolURN_PupilUPN_unique ON mtc_results.[${newTableName}]
      (
        SchoolURN ASC,
        PupilUPN ASC
      ) WITH ( PAD_INDEX = OFF,FILLFACTOR = 100,SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, STATISTICS_NORECOMPUTE = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON  ) ON [PRIMARY]
    `
    this.logger.verbose(`${this.logServiceName}: sql is ${fullSql}`)
    this.logger.verbose(`${this.logServiceName}: creating table ${newTableName}`)
    await this.sqlService.modify(fullSql, [])

    this.logger.verbose(`${this.logServiceName}: Creating trigger`)
    await this.sqlService.modify(triggerSql, [])

    this.logger.verbose(`${this.logServiceName}: Creating IX1`)
    await this.sqlService.modify(ix1Sql, [])

    this.logger.verbose(`${this.logServiceName}: Creating IX2`)
    await this.sqlService.modify(ix2Sql, [])

    this.logger.info(`${this.logServiceName}: new table ${newTableName} created`)

    const viewSql = `
        CREATE OR ALTER VIEW [mtc_results].[vewPsychometricReport]
        AS
          SELECT * FROM [mtc_results].[${newTableName}]
    `
    await this.sqlService.modify(viewSql, [])
    this.logger.info(`${this.logServiceName}: psychometricReport view recreated`)
    return newTableName
  }

  /**
   * Configure the External Data Source with a new short-lived SAS token, and set the location on the external data source.
   *
   */
  public async prepareForUpload (blobFile: string): Promise<void> {
    const blobService = new BlobService()
    const containerName = 'ps-report-bulk-upload'
    const containerUrl = await blobService.getContainerUrl(containerName)
    this.logger.verbose(`${this.logServiceName}: container url is ${containerUrl}`)
    const sasToken = await blobService.getBlobReadWriteSasToken(containerName, blobFile)
    this.logger.verbose('sasToken ' + sasToken)
    const sql = `
      IF (SELECT COUNT(*) FROM sys.database_scoped_credentials WHERE name = 'PsReportBulkUploadCredential') = 0
        BEGIN
          CREATE DATABASE SCOPED CREDENTIAL PsReportBulkUploadCredential
          WITH IDENTITY = 'SHARED ACCESS SIGNATURE', SECRET = '${sasToken}';
        END
      ELSE
        BEGIN
          ALTER DATABASE SCOPED CREDENTIAL PsReportBulkUploadCredential
          WITH IDENTITY = 'SHARED ACCESS SIGNATURE', SECRET = '${sasToken}'
        END

    IF (SELECT COUNT(*) FROM sys.external_data_sources WHERE name = 'PsReportData') = 0
      BEGIN
        CREATE EXTERNAL DATA SOURCE PsReportData
        WITH (
            TYPE = BLOB_STORAGE,
            LOCATION = '${containerUrl}',
            CREDENTIAL = PsReportBulkUploadCredential
        );
      END
    `
    await this.sqlService.modify(sql, [])
  }

  public async bulkUpload (incomingMessage: PsReportStagingCompleteMessage, tableName: string): Promise<void> {
    const sanitise = (sTainted: string): string => sTainted.replace(/[^a-zA-Z0-9-_.]+/g, '')
    const sFilename = sanitise(incomingMessage.filename)
    const sTablename = sanitise(tableName)

    // Find out the operating system that the SQL Server is running on due to capability mis-matches in SQL Versions on linux.
    const sql2 = `
      SELECT
        host_platform
      FROM
        sys.dm_os_host_info
    `
    const result = await this.sqlService.query(sql2, [])
    this.logger.verbose(`${this.logServiceName} OS is ${JSON.stringify(result)}`)
    if (result[0].host_platform === 'Linux') {
      this.logger.info(`${this.logServiceName}: SQL Server is running on Linux`)
      // SQL Server on Linux does not have a Bulk Upload permission, you have to use the `sa` user.
      // This is only suitable for local dev.
      const sqlConfig: mssql.config = {
        database: config.Sql.database,
        server: config.Sql.server,
        port: config.Sql.port,
        requestTimeout: config.Sql.censusRequestTimeout,
        connectionTimeout: config.Sql.connectionTimeout,
        user: config.Sql.LocalAdmin.user,
        password: config.Sql.LocalAdmin.password,
        options: config.Sql.options
      }
      await mssql.connect(sqlConfig)
    }

    // This file format is extremely finicky.
    // 1. The row must end in '\r\n'
    // 2. Dates should be in ISO format: YYYY-MM-DD
    const sql = `
      BULK INSERT mtc_results.[${sTablename}]
      FROM '${sFilename}'
      WITH (DATA_SOURCE = 'PsReportData',
                 FORMAT = 'CSV',
        FIELDTERMINATOR = ',',
          ROWTERMINATOR = '\r\n')
      ;`
    await mssql.query(sql)
  }

  public async cleanup (filename: string, dbTable: string): Promise<void> {
    // Remove CSV file
    // Remove ? new table (may not have been created)
    // Ensure the view table alias points to the last good PS report.
    this.logger.info(`${this.logServiceName}: cleanup() called`)
    // this.logger.info(`${this.logServiceName}: removing blob file: ${fileName}`)
    // const blobService = new BlobService() // delete
  }
}
