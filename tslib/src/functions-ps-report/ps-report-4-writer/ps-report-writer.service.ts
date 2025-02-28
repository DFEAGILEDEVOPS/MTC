import { type ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import moment from 'moment'
import { BlobService } from '../../azure/blob-service'
import * as mssql from 'mssql'
import config from '../../config'
import type { PsReportStagingCompleteMessage } from '../common/ps-report-service-bus-messages'
import * as R from 'ramda'

const containerName = 'ps-report-bulk-upload'

export class PsReportWriterService {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger
  private readonly invocationId: string
  private readonly logServiceName = 'PsReportWriterService'

  constructor (logger?: ILogger, invocationId?: string, sqlService?: ISqlService) {
    this.logger = logger ?? new ConsoleLogger()
    this.invocationId = invocationId ?? 'n/a'
    this.sqlService = sqlService ?? new SqlService(this.logger)
  }

  public logPrefix (): string {
    return `${this.logServiceName}: ${this.invocationId}`
  }

  public async tableExists (tableName: string): Promise<boolean> {
    const sql = `
    SELECT
      *
    FROM
      information_schema.tables
    WHERE
      table_name = @name`

    const params = [
      { name: 'name', value: tableName, type: mssql.NVarChar }
    ]
    const res = await this.sqlService.query(sql, params)
    // this.logger.trace(`${this.logPrefix()}: res: ${JSON.stringify(res)}`)
    // empty: res => []
    if (R.isEmpty(res)) {
      return false
    }
    return true
  }

  /**
   *
   * @returns Create a new ps report table and return the table name
   */
  public async createDestinationTableAndViewIfNotExists (incomingMessage: PsReportStagingCompleteMessage): Promise<string> {
    let ds = moment().format('YYYY_MM_DDTHHmm') // default
    // Match 'ps-report-staging-2024-02-27-1510.csv'
    const matches = incomingMessage.filename.match(/\d\d\d\d-\d\d-\d\d-\d\d\d\d/)
    if (matches !== null) {
      ds = matches[0].replaceAll('-', '_')
    }
    const newTableName = `psychometricReport_${ds}`

    const tableExists = await this.tableExists(newTableName)
    if (tableExists) {
      throw new Error('Table already exists: ' + newTableName)
    }

    const sql1 = `
      CREATE TABLE mtc_results.${newTableName} (
        PupilId int NOT NULL CONSTRAINT [PK_${newTableName}] PRIMARY KEY,
        PupilUPN nvarchar(32)  MASKED WITH (FUNCTION = 'default()') NOT NULL,
        createdAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_${newTableName}_createdAt] DEFAULT (getutcdate()),
        updatedAt datetimeoffset(7) NOT NULL CONSTRAINT [DF_${newTableName}_updatedAt] DEFAULT (getutcdate()),
        DOB date MASKED WITH (FUNCTION = 'default()') NULL,
        Gender char(1) MASKED WITH (FUNCTION = 'default()') NULL,
        Forename nvarchar(128) MASKED WITH (FUNCTION = 'default()') NULL,
        MiddleNames nvarchar(128) MASKED WITH (FUNCTION = 'default()') NULL,
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
        TestDate datetimeoffset(3) NULL,
        TimeStart datetimeoffset(7) NULL,
        TimeComplete datetimeoffset(7) NULL,
        TimeTaken decimal(9,3) NULL,
        ReasonNotTakingCheck varchar(3) NULL,
        ToECode int NULL,
        ImportedFromCensus bit NOT NULL CONSTRAINT [DF_${newTableName}_ImportedFromCensus] DEFAULT (0),
        IsEdited bit NOT NULL CONSTRAINT [DF_${newTableName}_IsEdited] DEFAULT (0), -- must end in comma
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
    this.logger.trace(`${this.logPrefix()}: creating table ${newTableName}`)
    await this.sqlService.modify(fullSql, [])

    this.logger.trace(`${this.logPrefix()}: Creating trigger`)
    await this.sqlService.modify(triggerSql, [])

    this.logger.trace(`${this.logPrefix()}: Creating IX1`)
    await this.sqlService.modify(ix1Sql, [])

    this.logger.trace(`${this.logPrefix()}: Creating IX2`)
    await this.sqlService.modify(ix2Sql, [])

    this.logger.info(`${this.logPrefix()}: new table ${newTableName} created`)

    return newTableName
  }

  /**
   * Configure the External Data Source with a new short-lived SAS token, and set the location on the external data source.
   *
   */
  public async prepareForUpload (blobFile: string): Promise<void> {
    const blobService = new BlobService()
    const containerUrl = await blobService.getContainerUrl(containerName)
    this.logger.trace(`${this.logPrefix()}: container url is ${containerUrl}`)
    const sasToken = await blobService.getBlobReadWriteSasToken(containerName, blobFile)
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

    // Find out system that the SQL Server is running on.  When SQL Server is running on Linux BULK_UPLOAD is not an assignable permission
    // and we have to use the admin account `sa`.  The usual way of getting the OS uses a sys table that is not available to the Azure database
    // user, so this is a workaround exploiting the difference between SQL Server products.
    // Dev, Test, Pre-Prod, Prod => 'Sql Database'
    // Local => 'Enterprise'
    const sql2 = `
      SELECT
        CASE ServerProperty('EngineEdition')
          WHEN 1 THEN 'Personal'
          WHEN 2 THEN 'Standard'
          WHEN 3 THEN 'Enterprise'
          WHEN 4 THEN 'Express'
          WHEN 5 THEN 'SQL Database'
          WHEN 6 THEN 'Azure Synapse Analytics'
          WHEN 8 THEN 'Azure SQL Managed Instance'
          WHEN 9 THEN 'Azure SQL Edge'
          WHEN 11 THEN 'Azure Synapse serverless SQL pool'
        ELSE 'Unknown'
      END as engineEdition;
    `

    /**
     * If running on SQL Azure the user will not have access to the sys tables, so we assume that an
     * error in this block means we are running in Azure.
     */
    const result = await this.sqlService.query(sql2, [])
    this.logger.trace(`${this.logPrefix()}: OS is ${JSON.stringify(result)}`)
    let sqlConfig: mssql.config

    if (result[0].engineEdition === 'Enterprise' || result[0].engineEdition === 'Azure SQL Edge') {
      this.logger.info(`${this.logServiceName}: SQL Server is (likely) running on Linux`)
      // SQL Server on Linux does not have a Bulk Upload permission, you have to use the `sa` user.
      // This is only suitable for local dev.
      sqlConfig = {
        database: config.Sql.database,
        server: config.Sql.server,
        port: config.Sql.port,
        requestTimeout: config.Sql.censusRequestTimeout,
        connectionTimeout: config.Sql.connectionTimeout,
        user: config.Sql.LocalAdmin.user,
        password: config.Sql.LocalAdmin.password,
        options: config.Sql.options
      }
    } else {
      // normal connect
      sqlConfig = {
        database: config.Sql.database,
        server: config.Sql.server,
        port: config.Sql.port,
        requestTimeout: config.Sql.censusRequestTimeout,
        connectionTimeout: config.Sql.connectionTimeout,
        user: config.Sql.user,
        password: config.Sql.password,
        options: config.Sql.options
      }
    }

    // Connect to sql for Azure and local - we will upload via mssql directly
    await mssql.connect(sqlConfig)

    // This file format is extremely finicky.
    // 1. The row must end in '\r\n'
    // 2. Dates should be in ISO format: YYYY-MM-DD
    // 3. It should be in UTF16le encoding with BOM
    const sql = `
      BULK INSERT mtc_results.[${sTablename}]
      FROM '${sFilename}'
      WITH (DATA_SOURCE = 'PsReportData',
                 FORMAT = 'CSV',
           DATAFILETYPE = 'widechar',
        FIELDTERMINATOR = ',')
      ;`
    await mssql.query(sql)
  }

  /**
   * Point the ps report view to the newly created table
   */
  public async recreateView (newTableName: string): Promise<void> {
    const viewSql = `
      CREATE OR ALTER VIEW [mtc_results].[vewPsychometricReport]
        AS
        SELECT * FROM [mtc_results].[${newTableName}]
    `
    await this.sqlService.modify(viewSql, [])
    this.logger.info(`${this.logPrefix()}: psychometricReport view recreated`)
  }
}
