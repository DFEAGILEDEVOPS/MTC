import { type IModifyResult, type ISqlParameter, type ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import { type IPsychometricReportLine, type IReportLineAnswer } from '../ps-report-3-transformer/models'
import { TYPES, MAX } from 'mssql'
import * as R from 'ramda'
import moment from 'moment'
import { BlobService } from '../../azure/blob-service'
import * as mssql from 'mssql'
import config from '../../config'

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
    const sql = `
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
        ImportedFromCensus bit NOT NULL CONSTRAINT [DF_${newTableName}_ImportedFromCensus] DEFAULT (0)
        -- Q1ID nvarchar(16) NULL,
        -- Q1Response nvarchar(60) NULL,
        -- Q1InputMethods nvarchar(16) NULL,
        -- Q1K nvarchar(max) NULL,
        -- Q1Sco tinyint NULL,
        -- Q1ResponseTime decimal(7,3) NULL,
        -- Q1TimeOut tinyint NULL,
        -- Q1TimeOutResponse tinyint NULL,
        -- Q1TimeOutSco tinyint NULL,
        -- Q1tLoad datetimeoffset(7) NULL,
        -- Q1tFirstKey datetimeoffset(7) NULL,
        -- Q1tLastKey datetimeoffset(7) NULL,
        -- Q1OverallTime decimal(7,3) NULL,
        -- Q1RecallTime decimal(7,3) NULL,
        -- Q1ReaderStart datetimeoffset(7) NULL,
        -- Q1ReaderEnd datetimeoffset(7) NULL,
        -- Q2ID nvarchar(16) NULL,
        -- Q2Response nvarchar(60) NULL,
        -- Q2InputMethods nvarchar(16) NULL,
        -- Q2K nvarchar(max) NULL,
        -- Q2Sco tinyint NULL,
        -- Q2ResponseTime decimal(7,3) NULL,
        -- Q2TimeOut tinyint NULL,
        -- Q2TimeOutResponse tinyint NULL,
        -- Q2TimeOutSco tinyint NULL,
        -- Q2tLoad datetimeoffset(7) NULL,
        -- Q2tFirstKey datetimeoffset(7) NULL,
        -- Q2tLastKey datetimeoffset(7) NULL,
        -- Q2OverallTime decimal(7,3) NULL,
        -- Q2RecallTime decimal(7,3) NULL,
        -- Q2ReaderStart datetimeoffset(7) NULL,
        -- Q2ReaderEnd datetimeoffset(7) NULL,
        -- Q3ID nvarchar(16) NULL,
        -- Q3Response nvarchar(60) NULL,
        -- Q3InputMethods nvarchar(16) NULL,
        -- Q3K nvarchar(max) NULL,
        -- Q3Sco tinyint NULL,
        -- Q3ResponseTime decimal(7,3) NULL,
        -- Q3TimeOut tinyint NULL,
        -- Q3TimeOutResponse tinyint NULL,
        -- Q3TimeOutSco tinyint NULL,
        -- Q3tLoad datetimeoffset(7) NULL,
        -- Q3tFirstKey datetimeoffset(7) NULL,
        -- Q3tLastKey datetimeoffset(7) NULL,
        -- Q3OverallTime decimal(7,3) NULL,
        -- Q3RecallTime decimal(7,3) NULL,
        -- Q3ReaderStart datetimeoffset(7) NULL,
        -- Q3ReaderEnd datetimeoffset(7) NULL,
        -- Q4ID nvarchar(16) NULL,
        -- Q4Response nvarchar(60) NULL,
        -- Q4InputMethods nvarchar(16) NULL,
        -- Q4K nvarchar(max) NULL,
        -- Q4Sco tinyint NULL,
        -- Q4ResponseTime decimal(7,3) NULL,
        -- Q4TimeOut tinyint NULL,
        -- Q4TimeOutResponse tinyint NULL,
        -- Q4TimeOutSco tinyint NULL,
        -- Q4tLoad datetimeoffset(7) NULL,
        -- Q4tFirstKey datetimeoffset(7) NULL,
        -- Q4tLastKey datetimeoffset(7) NULL,
        -- Q4OverallTime decimal(7,3) NULL,
        -- Q4RecallTime decimal(7,3) NULL,
        -- Q4ReaderStart datetimeoffset(7) NULL,
        -- Q4ReaderEnd datetimeoffset(7) NULL,
        -- Q5ID nvarchar(16) NULL,
        -- Q5Response nvarchar(60) NULL,
        -- Q5InputMethods nvarchar(16) NULL,
        -- Q5K nvarchar(max) NULL,
        -- Q5Sco tinyint NULL,
        -- Q5ResponseTime decimal(7,3) NULL,
        -- Q5TimeOut tinyint NULL,
        -- Q5TimeOutResponse tinyint NULL,
        -- Q5TimeOutSco tinyint NULL,
        -- Q5tLoad datetimeoffset(7) NULL,
        -- Q5tFirstKey datetimeoffset(7) NULL,
        -- Q5tLastKey datetimeoffset(7) NULL,
        -- Q5OverallTime decimal(7,3) NULL,
        -- Q5RecallTime decimal(7,3) NULL,
        -- Q5ReaderStart datetimeoffset(7) NULL,
        -- Q5ReaderEnd datetimeoffset(7) NULL,
        -- Q6ID nvarchar(16) NULL,
        -- Q6Response nvarchar(60) NULL,
        -- Q6InputMethods nvarchar(16) NULL,
        -- Q6K nvarchar(max) NULL,
        -- Q6Sco tinyint NULL,
        -- Q6ResponseTime decimal(7,3) NULL,
        -- Q6TimeOut tinyint NULL,
        -- Q6TimeOutResponse tinyint NULL,
        -- Q6TimeOutSco tinyint NULL,
        -- Q6tLoad datetimeoffset(7) NULL,
        -- Q6tFirstKey datetimeoffset(7) NULL,
        -- Q6tLastKey datetimeoffset(7) NULL,
        -- Q6OverallTime decimal(7,3) NULL,
        -- Q6RecallTime decimal(7,3) NULL,
        -- Q6ReaderStart datetimeoffset(7) NULL,
        -- Q6ReaderEnd datetimeoffset(7) NULL,
        -- Q7ID nvarchar(16) NULL,
        -- Q7Response nvarchar(60) NULL,
        -- Q7InputMethods nvarchar(16) NULL,
        -- Q7K nvarchar(max) NULL,
        -- Q7Sco tinyint NULL,
        -- Q7ResponseTime decimal(7,3) NULL,
        -- Q7TimeOut tinyint NULL,
        -- Q7TimeOutResponse tinyint NULL,
        -- Q7TimeOutSco tinyint NULL,
        -- Q7tLoad datetimeoffset(7) NULL,
        -- Q7tFirstKey datetimeoffset(7) NULL,
        -- Q7tLastKey datetimeoffset(7) NULL,
        -- Q7OverallTime decimal(7,3) NULL,
        -- Q7RecallTime decimal(7,3) NULL,
        -- Q7ReaderStart datetimeoffset(7) NULL,
        -- Q7ReaderEnd datetimeoffset(7) NULL,
        -- Q8ID nvarchar(16) NULL,
        -- Q8Response nvarchar(60) NULL,
        -- Q8InputMethods nvarchar(16) NULL,
        -- Q8K nvarchar(max) NULL,
        -- Q8Sco tinyint NULL,
        -- Q8ResponseTime decimal(7,3) NULL,
        -- Q8TimeOut tinyint NULL,
        -- Q8TimeOutResponse tinyint NULL,
        -- Q8TimeOutSco tinyint NULL,
        -- Q8tLoad datetimeoffset(7) NULL,
        -- Q8tFirstKey datetimeoffset(7) NULL,
        -- Q8tLastKey datetimeoffset(7) NULL,
        -- Q8OverallTime decimal(7,3) NULL,
        -- Q8RecallTime decimal(7,3) NULL,
        -- Q8ReaderStart datetimeoffset(7) NULL,
        -- Q8ReaderEnd datetimeoffset(7) NULL,
        -- Q9ID nvarchar(16) NULL,
        -- Q9Response nvarchar(60) NULL,
        -- Q9InputMethods nvarchar(16) NULL,
        -- Q9K nvarchar(max) NULL,
        -- Q9Sco tinyint NULL,
        -- Q9ResponseTime decimal(7,3) NULL,
        -- Q9TimeOut tinyint NULL,
        -- Q9TimeOutResponse tinyint NULL,
        -- Q9TimeOutSco tinyint NULL,
        -- Q9tLoad datetimeoffset(7) NULL,
        -- Q9tFirstKey datetimeoffset(7) NULL,
        -- Q9tLastKey datetimeoffset(7) NULL,
        -- Q9OverallTime decimal(7,3) NULL,
        -- Q9RecallTime decimal(7,3) NULL,
        -- Q9ReaderStart datetimeoffset(7) NULL,
        -- Q9ReaderEnd datetimeoffset(7) NULL,
        -- Q10ID nvarchar(16) NULL,
        -- Q10Response nvarchar(60) NULL,
        -- Q10InputMethods nvarchar(16) NULL,
        -- Q10K nvarchar(max) NULL,
        -- Q10Sco tinyint NULL,
        -- Q10ResponseTime decimal(7,3) NULL,
        -- Q10TimeOut tinyint NULL,
        -- Q10TimeOutResponse tinyint NULL,
        -- Q10TimeOutSco tinyint NULL,
        -- Q10tLoad datetimeoffset(7) NULL,
        -- Q10tFirstKey datetimeoffset(7) NULL,
        -- Q10tLastKey datetimeoffset(7) NULL,
        -- Q10OverallTime decimal(7,3) NULL,
        -- Q10RecallTime decimal(7,3) NULL,
        -- Q10ReaderStart datetimeoffset(7) NULL,
        -- Q10ReaderEnd datetimeoffset(7) NULL,
        -- Q11ID nvarchar(16) NULL,
        -- Q11Response nvarchar(60) NULL,
        -- Q11InputMethods nvarchar(16) NULL,
        -- Q11K nvarchar(max) NULL,
        -- Q11Sco tinyint NULL,
        -- Q11ResponseTime decimal(7,3) NULL,
        -- Q11TimeOut tinyint NULL,
        -- Q11TimeOutResponse tinyint NULL,
        -- Q11TimeOutSco tinyint NULL,
        -- Q11tLoad datetimeoffset(7) NULL,
        -- Q11tFirstKey datetimeoffset(7) NULL,
        -- Q11tLastKey datetimeoffset(7) NULL,
        -- Q11OverallTime decimal(7,3) NULL,
        -- Q11RecallTime decimal(7,3) NULL,
        -- Q11ReaderStart datetimeoffset(7) NULL,
        -- Q11ReaderEnd datetimeoffset(7) NULL,
        -- Q12ID nvarchar(16) NULL,
        -- Q12Response nvarchar(60) NULL,
        -- Q12InputMethods nvarchar(16) NULL,
        -- Q12K nvarchar(max) NULL,
        -- Q12Sco tinyint NULL,
        -- Q12ResponseTime decimal(7,3) NULL,
        -- Q12TimeOut tinyint NULL,
        -- Q12TimeOutResponse tinyint NULL,
        -- Q12TimeOutSco tinyint NULL,
        -- Q12tLoad datetimeoffset(7) NULL,
        -- Q12tFirstKey datetimeoffset(7) NULL,
        -- Q12tLastKey datetimeoffset(7) NULL,
        -- Q12OverallTime decimal(7,3) NULL,
        -- Q12RecallTime decimal(7,3) NULL,
        -- Q12ReaderStart datetimeoffset(7) NULL,
        -- Q12ReaderEnd datetimeoffset(7) NULL,
        -- Q13ID nvarchar(16) NULL,
        -- Q13Response nvarchar(60) NULL,
        -- Q13InputMethods nvarchar(16) NULL,
        -- Q13K nvarchar(max) NULL,
        -- Q13Sco tinyint NULL,
        -- Q13ResponseTime decimal(7,3) NULL,
        -- Q13TimeOut tinyint NULL,
        -- Q13TimeOutResponse tinyint NULL,
        -- Q13TimeOutSco tinyint NULL,
        -- Q13tLoad datetimeoffset(7) NULL,
        -- Q13tFirstKey datetimeoffset(7) NULL,
        -- Q13tLastKey datetimeoffset(7) NULL,
        -- Q13OverallTime decimal(7,3) NULL,
        -- Q13RecallTime decimal(7,3) NULL,
        -- Q13ReaderStart datetimeoffset(7) NULL,
        -- Q13ReaderEnd datetimeoffset(7) NULL,
        -- Q14ID nvarchar(16) NULL,
        -- Q14Response nvarchar(60) NULL,
        -- Q14InputMethods nvarchar(16) NULL,
        -- Q14K nvarchar(max) NULL,
        -- Q14Sco tinyint NULL,
        -- Q14ResponseTime decimal(7,3) NULL,
        -- Q14TimeOut tinyint NULL,
        -- Q14TimeOutResponse tinyint NULL,
        -- Q14TimeOutSco tinyint NULL,
        -- Q14tLoad datetimeoffset(7) NULL,
        -- Q14tFirstKey datetimeoffset(7) NULL,
        -- Q14tLastKey datetimeoffset(7) NULL,
        -- Q14OverallTime decimal(7,3) NULL,
        -- Q14RecallTime decimal(7,3) NULL,
        -- Q14ReaderStart datetimeoffset(7) NULL,
        -- Q14ReaderEnd datetimeoffset(7) NULL,
        -- Q15ID nvarchar(16) NULL,
        -- Q15Response nvarchar(60) NULL,
        -- Q15InputMethods nvarchar(16) NULL,
        -- Q15K nvarchar(max) NULL,
        -- Q15Sco tinyint NULL,
        -- Q15ResponseTime decimal(7,3) NULL,
        -- Q15TimeOut tinyint NULL,
        -- Q15TimeOutResponse tinyint NULL,
        -- Q15TimeOutSco tinyint NULL,
        -- Q15tLoad datetimeoffset(7) NULL,
        -- Q15tFirstKey datetimeoffset(7) NULL,
        -- Q15tLastKey datetimeoffset(7) NULL,
        -- Q15OverallTime decimal(7,3) NULL,
        -- Q15RecallTime decimal(7,3) NULL,
        -- Q15ReaderStart datetimeoffset(7) NULL,
        -- Q15ReaderEnd datetimeoffset(7) NULL,
        -- Q16ID nvarchar(16) NULL,
        -- Q16Response nvarchar(60) NULL,
        -- Q16InputMethods nvarchar(16) NULL,
        -- Q16K nvarchar(max) NULL,
        -- Q16Sco tinyint NULL,
        -- Q16ResponseTime decimal(7,3) NULL,
        -- Q16TimeOut tinyint NULL,
        -- Q16TimeOutResponse tinyint NULL,
        -- Q16TimeOutSco tinyint NULL,
        -- Q16tLoad datetimeoffset(7) NULL,
        -- Q16tFirstKey datetimeoffset(7) NULL,
        -- Q16tLastKey datetimeoffset(7) NULL,
        -- Q16OverallTime decimal(7,3) NULL,
        -- Q16RecallTime decimal(7,3) NULL,
        -- Q16ReaderStart datetimeoffset(7) NULL,
        -- Q16ReaderEnd datetimeoffset(7) NULL,
        -- Q17ID nvarchar(16) NULL,
        -- Q17Response nvarchar(60) NULL,
        -- Q17InputMethods nvarchar(16) NULL,
        -- Q17K nvarchar(max) NULL,
        -- Q17Sco tinyint NULL,
        -- Q17ResponseTime decimal(7,3) NULL,
        -- Q17TimeOut tinyint NULL,
        -- Q17TimeOutResponse tinyint NULL,
        -- Q17TimeOutSco tinyint NULL,
        -- Q17tLoad datetimeoffset(7) NULL,
        -- Q17tFirstKey datetimeoffset(7) NULL,
        -- Q17tLastKey datetimeoffset(7) NULL,
        -- Q17OverallTime decimal(7,3) NULL,
        -- Q17RecallTime decimal(7,3) NULL,
        -- Q17ReaderStart datetimeoffset(7) NULL,
        -- Q17ReaderEnd datetimeoffset(7) NULL,
        -- Q18ID nvarchar(16) NULL,
        -- Q18Response nvarchar(60) NULL,
        -- Q18InputMethods nvarchar(16) NULL,
        -- Q18K nvarchar(max) NULL,
        -- Q18Sco tinyint NULL,
        -- Q18ResponseTime decimal(7,3) NULL,
        -- Q18TimeOut tinyint NULL,
        -- Q18TimeOutResponse tinyint NULL,
        -- Q18TimeOutSco tinyint NULL,
        -- Q18tLoad datetimeoffset(7) NULL,
        -- Q18tFirstKey datetimeoffset(7) NULL,
        -- Q18tLastKey datetimeoffset(7) NULL,
        -- Q18OverallTime decimal(7,3) NULL,
        -- Q18RecallTime decimal(7,3) NULL,
        -- Q18ReaderStart datetimeoffset(7) NULL,
        -- Q18ReaderEnd datetimeoffset(7) NULL,
        -- Q19ID nvarchar(16) NULL,
        -- Q19Response nvarchar(60) NULL,
        -- Q19InputMethods nvarchar(16) NULL,
        -- Q19K nvarchar(max) NULL,
        -- Q19Sco tinyint NULL,
        -- Q19ResponseTime decimal(7,3) NULL,
        -- Q19TimeOut tinyint NULL,
        -- Q19TimeOutResponse tinyint NULL,
        -- Q19TimeOutSco tinyint NULL,
        -- Q19tLoad datetimeoffset(7) NULL,
        -- Q19tFirstKey datetimeoffset(7) NULL,
        -- Q19tLastKey datetimeoffset(7) NULL,
        -- Q19OverallTime decimal(7,3) NULL,
        -- Q19RecallTime decimal(7,3) NULL,
        -- Q19ReaderStart datetimeoffset(7) NULL,
        -- Q19ReaderEnd datetimeoffset(7) NULL,
        -- Q20ID nvarchar(16) NULL,
        -- Q20Response nvarchar(60) NULL,
        -- Q20InputMethods nvarchar(16) NULL,
        -- Q20K nvarchar(max) NULL,
        -- Q20Sco tinyint NULL,
        -- Q20ResponseTime decimal(7,3) NULL,
        -- Q20TimeOut tinyint NULL,
        -- Q20TimeOutResponse tinyint NULL,
        -- Q20TimeOutSco tinyint NULL,
        -- Q20tLoad datetimeoffset(7) NULL,
        -- Q20tFirstKey datetimeoffset(7) NULL,
        -- Q20tLastKey datetimeoffset(7) NULL,
        -- Q20OverallTime decimal(7,3) NULL,
        -- Q20RecallTime decimal(7,3) NULL,
        -- Q20ReaderStart datetimeoffset(7) NULL,
        -- Q20ReaderEnd datetimeoffset(7) NULL,
        -- Q21ID nvarchar(16) NULL,
        -- Q21Response nvarchar(60) NULL,
        -- Q21InputMethods nvarchar(16) NULL,
        -- Q21K nvarchar(max) NULL,
        -- Q21Sco tinyint NULL,
        -- Q21ResponseTime decimal(7,3) NULL,
        -- Q21TimeOut tinyint NULL,
        -- Q21TimeOutResponse tinyint NULL,
        -- Q21TimeOutSco tinyint NULL,
        -- Q21tLoad datetimeoffset(7) NULL,
        -- Q21tFirstKey datetimeoffset(7) NULL,
        -- Q21tLastKey datetimeoffset(7) NULL,
        -- Q21OverallTime decimal(7,3) NULL,
        -- Q21RecallTime decimal(7,3) NULL,
        -- Q21ReaderStart datetimeoffset(7) NULL,
        -- Q21ReaderEnd datetimeoffset(7) NULL,
        -- Q22ID nvarchar(16) NULL,
        -- Q22Response nvarchar(60) NULL,
        -- Q22InputMethods nvarchar(16) NULL,
        -- Q22K nvarchar(max) NULL,
        -- Q22Sco tinyint NULL,
        -- Q22ResponseTime decimal(7,3) NULL,
        -- Q22TimeOut tinyint NULL,
        -- Q22TimeOutResponse tinyint NULL,
        -- Q22TimeOutSco tinyint NULL,
        -- Q22tLoad datetimeoffset(7) NULL,
        -- Q22tFirstKey datetimeoffset(7) NULL,
        -- Q22tLastKey datetimeoffset(7) NULL,
        -- Q22OverallTime decimal(7,3) NULL,
        -- Q22RecallTime decimal(7,3) NULL,
        -- Q22ReaderStart datetimeoffset(7) NULL,
        -- Q22ReaderEnd datetimeoffset(7) NULL,
        -- Q23ID nvarchar(16) NULL,
        -- Q23Response nvarchar(60) NULL,
        -- Q23InputMethods nvarchar(16) NULL,
        -- Q23K nvarchar(max) NULL,
        -- Q23Sco tinyint NULL,
        -- Q23ResponseTime decimal(7,3) NULL,
        -- Q23TimeOut tinyint NULL,
        -- Q23TimeOutResponse tinyint NULL,
        -- Q23TimeOutSco tinyint NULL,
        -- Q23tLoad datetimeoffset(7) NULL,
        -- Q23tFirstKey datetimeoffset(7) NULL,
        -- Q23tLastKey datetimeoffset(7) NULL,
        -- Q23OverallTime decimal(7,3) NULL,
        -- Q23RecallTime decimal(7,3) NULL,
        -- Q23ReaderStart datetimeoffset(7) NULL,
        -- Q23ReaderEnd datetimeoffset(7) NULL,
        -- Q24ID nvarchar(16) NULL,
        -- Q24Response nvarchar(60) NULL,
        -- Q24InputMethods nvarchar(16) NULL,
        -- Q24K nvarchar(max) NULL,
        -- Q24Sco tinyint NULL,
        -- Q24ResponseTime decimal(7,3) NULL,
        -- Q24TimeOut tinyint NULL,
        -- Q24TimeOutResponse tinyint NULL,
        -- Q24TimeOutSco tinyint NULL,
        -- Q24tLoad datetimeoffset(7) NULL,
        -- Q24tFirstKey datetimeoffset(7) NULL,
        -- Q24tLastKey datetimeoffset(7) NULL,
        -- Q24OverallTime decimal(7,3) NULL,
        -- Q24RecallTime decimal(7,3) NULL,
        -- Q24ReaderStart datetimeoffset(7) NULL,
        -- Q24ReaderEnd datetimeoffset(7) NULL,
        -- Q25ID nvarchar(16) NULL,
        -- Q25Response nvarchar(60) NULL,
        -- Q25InputMethods nvarchar(16) NULL,
        -- Q25K nvarchar(max) NULL,
        -- Q25Sco tinyint NULL,
        -- Q25ResponseTime decimal(7,3) NULL,
        -- Q25TimeOut tinyint NULL,
        -- Q25TimeOutResponse tinyint NULL,
        -- Q25TimeOutSco tinyint NULL,
        -- Q25tLoad datetimeoffset(7) NULL,
        -- Q25tFirstKey datetimeoffset(7) NULL,
        -- Q25tLastKey datetimeoffset(7) NULL,
        -- Q25OverallTime decimal(7,3) NULL,
        -- Q25RecallTime decimal(7,3) NULL,
        -- Q25ReaderStart datetimeoffset(7) NULL,
        -- Q25ReaderEnd datetimeoffset(7) NULL
      );
    `

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
    this.logger.verbose(`${this.logServiceName}: creating table ${newTableName}`)
    await this.sqlService.modify(sql, [])

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

  public async bulkUpload (fileName: string, tableName: string): Promise<void> {
    // -- const res = await this.sqlService.query('SELECT CURRENT_USER')
    // -- this.logger.verbose('PRE USER ' + JSON.stringify(res))
    const sanitise = (sTainted: string): string => sTainted.replace(/[^a-zA-Z0-9-_.]+/g, '')
    const sFileName = sanitise(fileName)
    const sTableName = sanitise(tableName)

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
    // 2. The DOB should be in YYYY-MM-DD format
    const sql = `
      BULK INSERT mtc_results.[${sTableName}]
      FROM '${sFileName}'
      WITH (DATA_SOURCE = 'PsReportData',
                 FORMAT = 'CSV',
        FIELDTERMINATOR = ',',
          ROWTERMINATOR = '\r\n')
      ;`
    await mssql.query(sql)
  }

  public async cleanup (fileName: string, dbTable: string): Promise<void> {
    // Remove CSV file
    // Remove ? new table (may not have been created)
    // Ensure the view table alias points to the last good PS report.
    this.logger.info(`${this.logServiceName}: cleanup() called`)
    // this.logger.info(`${this.logServiceName}: removing blob file: ${fileName}`)
    // const blobService = new BlobService() // delete
  }

  private parseTimeout (answers: IReportLineAnswer[], index: number, prop: 'timeout' | 'timeoutResponse' | 'timeoutScore'): number | null {
    const answer = answers[index]
    if (answer === undefined) {
      return null
    }
    const value = answer[prop]
    if (typeof value === 'boolean') {
      return value ? 1 : 0
    }
    return value
  }

  private generateParams (data: IPsychometricReportLine): ISqlParameter[] {
    const params = [
      { name: 'pupilId', value: data.PupilDatabaseId, type: TYPES.Int },
      { name: 'dob', value: data.DOB?.toDate(), type: TYPES.Date },
      { name: 'gender', value: data.Gender, type: TYPES.Char(1) },
      { name: 'pupilUPN', value: data.PupilUPN, type: TYPES.NVarChar(32) },
      { name: 'forename', value: data.Forename, type: TYPES.NVarChar(128) },
      { name: 'surname', value: data.Surname, type: TYPES.NVarChar(128) },
      { name: 'formMark', value: data.FormMark, type: TYPES.Int },
      { name: 'qDisplayTime', value: data.QDisplayTime, type: TYPES.Decimal(5, 2) },
      { name: 'pauseLength', value: data.PauseLength, type: TYPES.Decimal(5, 2) },
      { name: 'accessArr', value: data.AccessArr, type: TYPES.NVarChar(128) },
      { name: 'restartReason', value: data.RestartReason, type: TYPES.SmallInt },
      { name: 'restartNumber', value: data.RestartNumber, type: TYPES.Int },
      { name: 'reasonNotTakingCheck', value: data.ReasonNotTakingCheck, type: TYPES.Char(1) },
      { name: 'pupilStatus', value: data.PupilStatus, type: TYPES.NVarChar(32) },
      { name: 'deviceId', value: data.DeviceID, type: TYPES.NVarChar(128) },
      { name: 'browserType', value: data.BrowserType, type: TYPES.NVarChar(128) },
      { name: 'schoolName', value: data.SchoolName, type: TYPES.NVarChar(MAX) },
      { name: 'estab', value: data.Estab, type: TYPES.SmallInt },
      { name: 'schoolUrn', value: data.SchoolURN, type: TYPES.Int },
      { name: 'laNum', value: data.LAnum, type: TYPES.Int },
      { name: 'attemptId', value: data.AttemptID, type: TYPES.UniqueIdentifier },
      { name: 'formId', value: data.FormID, type: TYPES.NVarChar(64) },
      { name: 'testDate', value: data.TestDate?.toDate(), type: TYPES.Date },
      { name: 'timeStart', value: data.TimeStart?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeComplete', value: data.TimeComplete?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeTaken', value: data.TimeTaken, type: TYPES.Decimal(9, 3) },
      { name: 'toeCode', value: data.ToECode, type: TYPES.Int },
      { name: 'importedFromCensus', value: data.ImportedFromCensus, type: TYPES.Bit }
    ]

    for (let i = 1; i <= 25; i++) {
      /* eslint-disable no-multi-spaces */
      params.push({ name: `q${i}Id`,              value: data.answers[i - 1]?.id,                            type: TYPES.NVarChar(16) })
      params.push({ name: `q${i}response`,        value: data.answers[i - 1]?.response,                      type: TYPES.NVarChar(60) })
      params.push({ name: `q${i}inputMethods`,    value: data.answers[i - 1]?.inputMethods,                  type: TYPES.NVarChar(16) })
      params.push({ name: `q${i}keystrokes`,      value: data.answers[i - 1]?.keystrokes,                    type: TYPES.NVarChar(MAX) })
      params.push({ name: `q${i}score`,           value: data.answers[i - 1]?.score,                         type: TYPES.TinyInt })
      params.push({ name: `q${i}responseTime`,    value: data.answers[i - 1]?.responseTime,                  type: TYPES.Decimal(7, 3) })
      params.push({ name: `q${i}timeout`,         value: this.parseTimeout(data.answers, i - 1, 'timeout'),               type: TYPES.TinyInt })
      params.push({ name: `q${i}timeoutResponse`, value: this.parseTimeout(data.answers, i - 1, 'timeoutResponse'),       type: TYPES.TinyInt })
      params.push({ name: `q${i}timeoutScore`,    value: this.parseTimeout(data.answers, i - 1, 'timeoutScore'),          type: TYPES.TinyInt })
      params.push({ name: `q${i}loadTime`,        value: data.answers[i - 1]?.loadTime?.toDate(),            type: TYPES.DateTimeOffset(3) })
      params.push({ name: `q${i}firstKey`,        value: data.answers[i - 1]?.firstKey?.toDate(),            type: TYPES.DateTimeOffset(3) })
      params.push({ name: `q${i}lastKey`,         value: data.answers[i - 1]?.lastKey?.toDate(),             type: TYPES.DateTimeOffset(3) })
      params.push({ name: `q${i}overallTime`,     value: data.answers[i - 1]?.overallTime,                   type: TYPES.Decimal(7, 3) })
      params.push({ name: `q${i}recallTime`,      value: data.answers[i - 1]?.recallTime,                    type: TYPES.Decimal(7, 3) })
      params.push({ name: `q${i}readerStart`,     value: data.answers[i - 1]?.questionReaderStart?.toDate(), type: TYPES.DateTimeOffset(3) })
      params.push({ name: `q${i}readerEnd`,       value: data.answers[i - 1]?.questionReaderEnd?.toDate(),   type: TYPES.DateTimeOffset(3) })
      /* eslint-enable no-multi-spaces */
    }
    return params
  }

  private generateSql (data: IPsychometricReportLine): string {
    const updateAnswers = R.repeat(1, 25).map((element, index) => index + 1).map(n => {
      return `
            Q${n}ID = @q${n}id, Q${n}Response = @q${n}response, Q${n}InputMethods = @q${n}inputMethods, Q${n}K = @q${n}keystrokes, Q${n}Sco = @q${n}score,
            Q${n}ResponseTime = @q${n}responseTime, Q${n}TimeOut = @q${n}timeout, Q${n}TimeOutResponse = @q${n}timeoutResponse,
            Q${n}TimeOutSco = @q${n}timeoutScore, Q${n}tLoad = @q${n}loadTime, Q${n}tFirstKey = @q${n}firstKey, Q${n}tLastKey = @q${n}lastKey,
            Q${n}OverallTime = @q${n}overallTime, Q${n}RecallTime = @q${n}recallTime, Q${n}ReaderStart = @q${n}readerStart, Q${n}ReaderEnd = @q${n}readerEnd
      `
    })
    const sql = `
        IF EXISTS ( SELECT * FROM [mtc_results].[psychometricReport] WHERE pupilId = @pupilId )
        BEGIN
           UPDATE [mtc_results].[psychometricReport]
           SET
              PupilUPN = @pupilUPN, DOB = @dob, Gender = @gender, Forename = @forename, Surname = @surname, FormMark = @formMark, QDisplayTime = @qDisplayTime,
              PauseLength = @pauseLength, AccessArr = @accessArr, RestartReason = @restartReason, RestartNumber = @restartNumber,
              ReasonNotTakingCheck = @ReasonNotTakingCheck, PupilStatus = @pupilStatus, DeviceId = @deviceId, BrowserType = @browserType, SchoolName = @schoolName, Estab = @estab,
              SchoolURN = @schoolURN, LANum = @laNum, AttemptId = @attemptId, FormID = @formId, TestDate = @testDate, TimeStart = @timeStart,
              TimeComplete = @timeComplete, TimeTaken = @timeTaken, ToECode = @toeCode, ImportedFromCensus = @importedFromCensus,

              ${updateAnswers.join(',\n')}

           WHERE PupilId = @pupilId;
        END
        ELSE
        BEGIN
          INSERT into [mtc_results].[psychometricReport] (PupilId, DOB, Gender, PupilUPN, Forename, Surname, FormMark, QDisplayTime, PauseLength,
                                                        AccessArr, RestartReason, RestartNumber, ReasonNotTakingCheck, PupilStatus,
                                                        DeviceId, BrowserType, SchoolName, Estab, SchoolURN,
                                                        LANum, AttemptId, FormID, TestDate, TimeStart, TimeComplete, TimeTaken, ToECode,
                                                        ImportedFromCensus,
                                                        Q1ID, Q1Response, Q1InputMethods, Q1K, Q1Sco, Q1ResponseTime, Q1TimeOut,
                                                        Q1TimeOutResponse, Q1TimeOutSco, Q1tLoad, Q1tFirstKey, Q1tLastKey, Q1OverallTime,
                                                        Q1RecallTime, Q1ReaderStart, Q1ReaderEnd,
                                                        Q2ID, Q2Response, Q2InputMethods, Q2K,
                                                        Q2Sco, Q2ResponseTime, Q2TimeOut, Q2TimeOutResponse, Q2TimeOutSco, Q2tLoad,
                                                        Q2tFirstKey, Q2tLastKey, Q2OverallTime, Q2RecallTime, Q2ReaderStart, Q2ReaderEnd,
                                                        Q3ID, Q3Response, Q3InputMethods, Q3K, Q3Sco, Q3ResponseTime, Q3TimeOut,
                                                        Q3TimeOutResponse, Q3TimeOutSco, Q3tLoad, Q3tFirstKey, Q3tLastKey, Q3OverallTime,
                                                        Q3RecallTime, Q3ReaderStart, Q3ReaderEnd, Q4ID, Q4Response, Q4InputMethods, Q4K,
                                                        Q4Sco, Q4ResponseTime, Q4TimeOut, Q4TimeOutResponse, Q4TimeOutSco, Q4tLoad,
                                                        Q4tFirstKey, Q4tLastKey, Q4OverallTime, Q4RecallTime, Q4ReaderStart, Q4ReaderEnd,
                                                        Q5ID, Q5Response, Q5InputMethods, Q5K, Q5Sco, Q5ResponseTime, Q5TimeOut,
                                                        Q5TimeOutResponse, Q5TimeOutSco, Q5tLoad, Q5tFirstKey, Q5tLastKey, Q5OverallTime,
                                                        Q5RecallTime, Q5ReaderStart, Q5ReaderEnd, Q6ID, Q6Response, Q6InputMethods, Q6K,
                                                        Q6Sco, Q6ResponseTime, Q6TimeOut, Q6TimeOutResponse, Q6TimeOutSco, Q6tLoad,
                                                        Q6tFirstKey, Q6tLastKey, Q6OverallTime, Q6RecallTime, Q6ReaderStart, Q6ReaderEnd,
                                                        Q7ID, Q7Response, Q7InputMethods, Q7K, Q7Sco, Q7ResponseTime, Q7TimeOut,
                                                        Q7TimeOutResponse, Q7TimeOutSco, Q7tLoad, Q7tFirstKey, Q7tLastKey, Q7OverallTime,
                                                        Q7RecallTime, Q7ReaderStart, Q7ReaderEnd, Q8ID, Q8Response, Q8InputMethods, Q8K,
                                                        Q8Sco, Q8ResponseTime, Q8TimeOut, Q8TimeOutResponse, Q8TimeOutSco, Q8tLoad,
                                                        Q8tFirstKey, Q8tLastKey, Q8OverallTime, Q8RecallTime, Q8ReaderStart, Q8ReaderEnd,
                                                        Q9ID, Q9Response, Q9InputMethods, Q9K, Q9Sco, Q9ResponseTime, Q9TimeOut,
                                                        Q9TimeOutResponse, Q9TimeOutSco, Q9tLoad, Q9tFirstKey, Q9tLastKey, Q9OverallTime,
                                                        Q9RecallTime, Q9ReaderStart, Q9ReaderEnd, Q10ID, Q10Response, Q10InputMethods, Q10K,
                                                        Q10Sco, Q10ResponseTime, Q10TimeOut, Q10TimeOutResponse, Q10TimeOutSco, Q10tLoad,
                                                        Q10tFirstKey, Q10tLastKey, Q10OverallTime, Q10RecallTime, Q10ReaderStart,
                                                        Q10ReaderEnd, Q11ID, Q11Response, Q11InputMethods, Q11K, Q11Sco, Q11ResponseTime,
                                                        Q11TimeOut, Q11TimeOutResponse, Q11TimeOutSco, Q11tLoad, Q11tFirstKey, Q11tLastKey,
                                                        Q11OverallTime, Q11RecallTime, Q11ReaderStart, Q11ReaderEnd, Q12ID, Q12Response,
                                                        Q12InputMethods, Q12K, Q12Sco, Q12ResponseTime, Q12TimeOut, Q12TimeOutResponse,
                                                        Q12TimeOutSco, Q12tLoad, Q12tFirstKey, Q12tLastKey, Q12OverallTime, Q12RecallTime,
                                                        Q12ReaderStart, Q12ReaderEnd, Q13ID, Q13Response, Q13InputMethods, Q13K, Q13Sco,
                                                        Q13ResponseTime, Q13TimeOut, Q13TimeOutResponse, Q13TimeOutSco, Q13tLoad,
                                                        Q13tFirstKey, Q13tLastKey, Q13OverallTime, Q13RecallTime, Q13ReaderStart,
                                                        Q13ReaderEnd, Q14ID, Q14Response, Q14InputMethods, Q14K, Q14Sco, Q14ResponseTime,
                                                        Q14TimeOut, Q14TimeOutResponse, Q14TimeOutSco, Q14tLoad, Q14tFirstKey, Q14tLastKey,
                                                        Q14OverallTime, Q14RecallTime, Q14ReaderStart, Q14ReaderEnd, Q15ID, Q15Response,
                                                        Q15InputMethods, Q15K, Q15Sco, Q15ResponseTime, Q15TimeOut, Q15TimeOutResponse,
                                                        Q15TimeOutSco, Q15tLoad, Q15tFirstKey, Q15tLastKey, Q15OverallTime, Q15RecallTime,
                                                        Q15ReaderStart, Q15ReaderEnd, Q16ID, Q16Response, Q16InputMethods, Q16K, Q16Sco,
                                                        Q16ResponseTime, Q16TimeOut, Q16TimeOutResponse, Q16TimeOutSco, Q16tLoad,
                                                        Q16tFirstKey, Q16tLastKey, Q16OverallTime, Q16RecallTime, Q16ReaderStart,
                                                        Q16ReaderEnd, Q17ID, Q17Response, Q17InputMethods, Q17K, Q17Sco, Q17ResponseTime,
                                                        Q17TimeOut, Q17TimeOutResponse, Q17TimeOutSco, Q17tLoad, Q17tFirstKey, Q17tLastKey,
                                                        Q17OverallTime, Q17RecallTime, Q17ReaderStart, Q17ReaderEnd, Q18ID, Q18Response,
                                                        Q18InputMethods, Q18K, Q18Sco, Q18ResponseTime, Q18TimeOut, Q18TimeOutResponse,
                                                        Q18TimeOutSco, Q18tLoad, Q18tFirstKey, Q18tLastKey, Q18OverallTime, Q18RecallTime,
                                                        Q18ReaderStart, Q18ReaderEnd, Q19ID, Q19Response, Q19InputMethods, Q19K, Q19Sco,
                                                        Q19ResponseTime, Q19TimeOut, Q19TimeOutResponse, Q19TimeOutSco, Q19tLoad,
                                                        Q19tFirstKey, Q19tLastKey, Q19OverallTime, Q19RecallTime, Q19ReaderStart,
                                                        Q19ReaderEnd, Q20ID, Q20Response, Q20InputMethods, Q20K, Q20Sco, Q20ResponseTime,
                                                        Q20TimeOut, Q20TimeOutResponse, Q20TimeOutSco, Q20tLoad, Q20tFirstKey, Q20tLastKey,
                                                        Q20OverallTime, Q20RecallTime, Q20ReaderStart, Q20ReaderEnd, Q21ID, Q21Response,
                                                        Q21InputMethods, Q21K, Q21Sco, Q21ResponseTime, Q21TimeOut, Q21TimeOutResponse,
                                                        Q21TimeOutSco, Q21tLoad, Q21tFirstKey, Q21tLastKey, Q21OverallTime, Q21RecallTime,
                                                        Q21ReaderStart, Q21ReaderEnd, Q22ID, Q22Response, Q22InputMethods, Q22K, Q22Sco,
                                                        Q22ResponseTime, Q22TimeOut, Q22TimeOutResponse, Q22TimeOutSco, Q22tLoad,
                                                        Q22tFirstKey, Q22tLastKey, Q22OverallTime, Q22RecallTime, Q22ReaderStart,
                                                        Q22ReaderEnd, Q23ID, Q23Response, Q23InputMethods, Q23K, Q23Sco, Q23ResponseTime,
                                                        Q23TimeOut, Q23TimeOutResponse, Q23TimeOutSco, Q23tLoad, Q23tFirstKey, Q23tLastKey,
                                                        Q23OverallTime, Q23RecallTime, Q23ReaderStart, Q23ReaderEnd, Q24ID, Q24Response,
                                                        Q24InputMethods, Q24K, Q24Sco, Q24ResponseTime, Q24TimeOut, Q24TimeOutResponse,
                                                        Q24TimeOutSco, Q24tLoad, Q24tFirstKey, Q24tLastKey, Q24OverallTime, Q24RecallTime,
                                                        Q24ReaderStart, Q24ReaderEnd, Q25ID, Q25Response, Q25InputMethods, Q25K, Q25Sco,
                                                        Q25ResponseTime, Q25TimeOut, Q25TimeOutResponse, Q25TimeOutSco, Q25tLoad,
                                                        Q25tFirstKey, Q25tLastKey, Q25OverallTime, Q25RecallTime, Q25ReaderStart,
                                                        Q25ReaderEnd)
        VALUES (@pupilId,
                @dob,
                @gender,
                @pupilUPN,
                @forename,
                @surname,
                @formMark,
                @qDisplayTime,
                @pauseLength,
                @accessArr,
                @restartReason,
                @restartNumber,
                @reasonNotTakingCheck,
                @pupilStatus,
                @deviceId,
                @browserType,
                @schoolName,
                @estab,
                @schoolUrn,
                @laNum,
                @attemptId,
                @formId,
                @testDate,
                @timeStart,
                @timeComplete,
                @timeTaken,
                @toeCode,
                @importedFromCensus,

                @q1Id,
                @q1response,
                @q1inputMethods,
                @q1keystrokes,
                @q1score,
                @q1responseTime,
                @q1timeout,
                @q1timeoutResponse,
                @q1timeoutScore,
                @q1loadTime,
                @q1firstKey,
                @q1lastKey,
                @q1overallTime,
                @q1recallTime,
                @q1readerStart,
                @q1readerEnd,

                @q2Id,
                @q2response,
                @q2inputMethods,
                @q2keystrokes,
                @q2score,
                @q2responseTime,
                @q2timeout,
                @q2timeoutResponse,
                @q2timeoutScore,
                @q2loadTime,
                @q2firstKey,
                @q2lastKey,
                @q2overallTime,
                @q2recallTime,
                @q2readerStart,
                @q2readerEnd,

                @q3Id,
                @q3response,
                @q3inputMethods,
                @q3keystrokes,
                @q3score,
                @q3responseTime,
                @q3timeout,
                @q3timeoutResponse,
                @q3timeoutScore,
                @q3loadTime,
                @q3firstKey,
                @q3lastKey,
                @q3overallTime,
                @q3recallTime,
                @q3readerStart,
                @q3readerEnd,

                @q4Id,
                @q4response,
                @q4inputMethods,
                @q4keystrokes,
                @q4score,
                @q4responseTime,
                @q4timeout,
                @q4timeoutResponse,
                @q4timeoutScore,
                @q4loadTime,
                @q4firstKey,
                @q4lastKey,
                @q4overallTime,
                @q4recallTime,
                @q4readerStart,
                @q4readerEnd,

                @q5Id,
                @q5response,
                @q5inputMethods,
                @q5keystrokes,
                @q5score,
                @q5responseTime,
                @q5timeout,
                @q5timeoutResponse,
                @q5timeoutScore,
                @q5loadTime,
                @q5firstKey,
                @q5lastKey,
                @q5overallTime,
                @q5recallTime,
                @q5readerStart,
                @q5readerEnd,

                @q6Id,
                @q6response,
                @q6inputMethods,
                @q6keystrokes,
                @q6score,
                @q6responseTime,
                @q6timeout,
                @q6timeoutResponse,
                @q6timeoutScore,
                @q6loadTime,
                @q6firstKey,
                @q6lastKey,
                @q6overallTime,
                @q6recallTime,
                @q6readerStart,
                @q6readerEnd,

                @q7Id,
                @q7response,
                @q7inputMethods,
                @q7keystrokes,
                @q7score,
                @q7responseTime,
                @q7timeout,
                @q7timeoutResponse,
                @q7timeoutScore,
                @q7loadTime,
                @q7firstKey,
                @q7lastKey,
                @q7overallTime,
                @q7recallTime,
                @q7readerStart,
                @q7readerEnd,

                @q8Id,
                @q8response,
                @q8inputMethods,
                @q8keystrokes,
                @q8score,
                @q8responseTime,
                @q8timeout,
                @q8timeoutResponse,
                @q8timeoutScore,
                @q8loadTime,
                @q8firstKey,
                @q8lastKey,
                @q8overallTime,
                @q8recallTime,
                @q8readerStart,
                @q8readerEnd,

                @q9Id,
                @q9response,
                @q9inputMethods,
                @q9keystrokes,
                @q9score,
                @q9responseTime,
                @q9timeout,
                @q9timeoutResponse,
                @q9timeoutScore,
                @q9loadTime,
                @q9firstKey,
                @q9lastKey,
                @q9overallTime,
                @q9recallTime,
                @q9readerStart,
                @q9readerEnd,

                @q10Id,
                @q10response,
                @q10inputMethods,
                @q10keystrokes,
                @q10score,
                @q10responseTime,
                @q10timeout,
                @q10timeoutResponse,
                @q10timeoutScore,
                @q10loadTime,
                @q10firstKey,
                @q10lastKey,
                @q10overallTime,
                @q10recallTime,
                @q10readerStart,
                @q10readerEnd,

                @q11Id,
                @q11response,
                @q11inputMethods,
                @q11keystrokes,
                @q11score,
                @q11responseTime,
                @q11timeout,
                @q11timeoutResponse,
                @q11timeoutScore,
                @q11loadTime,
                @q11firstKey,
                @q11lastKey,
                @q11overallTime,
                @q11recallTime,
                @q11readerStart,
                @q11readerEnd,

                @q12Id,
                @q12response,
                @q12inputMethods,
                @q12keystrokes,
                @q12score,
                @q12responseTime,
                @q12timeout,
                @q12timeoutResponse,
                @q12timeoutScore,
                @q12loadTime,
                @q12firstKey,
                @q12lastKey,
                @q12overallTime,
                @q12recallTime,
                @q12readerStart,
                @q12readerEnd,

                @q13Id,
                @q13response,
                @q13inputMethods,
                @q13keystrokes,
                @q13score,
                @q13responseTime,
                @q13timeout,
                @q13timeoutResponse,
                @q13timeoutScore,
                @q13loadTime,
                @q13firstKey,
                @q13lastKey,
                @q13overallTime,
                @q13recallTime,
                @q13readerStart,
                @q13readerEnd,

                @q14Id,
                @q14response,
                @q14inputMethods,
                @q14keystrokes,
                @q14score,
                @q14responseTime,
                @q14timeout,
                @q14timeoutResponse,
                @q14timeoutScore,
                @q14loadTime,
                @q14firstKey,
                @q14lastKey,
                @q14overallTime,
                @q14recallTime,
                @q14readerStart,
                @q14readerEnd,

                @q15Id,
                @q15response,
                @q15inputMethods,
                @q15keystrokes,
                @q15score,
                @q15responseTime,
                @q15timeout,
                @q15timeoutResponse,
                @q15timeoutScore,
                @q15loadTime,
                @q15firstKey,
                @q15lastKey,
                @q15overallTime,
                @q15recallTime,
                @q15readerStart,
                @q15readerEnd,

                @q16Id,
                @q16response,
                @q16inputMethods,
                @q16keystrokes,
                @q16score,
                @q16responseTime,
                @q16timeout,
                @q16timeoutResponse,
                @q16timeoutScore,
                @q16loadTime,
                @q16firstKey,
                @q16lastKey,
                @q16overallTime,
                @q16recallTime,
                @q16readerStart,
                @q16readerEnd,

                @q17Id,
                @q17response,
                @q17inputMethods,
                @q17keystrokes,
                @q17score,
                @q17responseTime,
                @q17timeout,
                @q17timeoutResponse,
                @q17timeoutScore,
                @q17loadTime,
                @q17firstKey,
                @q17lastKey,
                @q17overallTime,
                @q17recallTime,
                @q17readerStart,
                @q17readerEnd,

                @q18Id,
                @q18response,
                @q18inputMethods,
                @q18keystrokes,
                @q18score,
                @q18responseTime,
                @q18timeout,
                @q18timeoutResponse,
                @q18timeoutScore,
                @q18loadTime,
                @q18firstKey,
                @q18lastKey,
                @q18overallTime,
                @q18recallTime,
                @q18readerStart,
                @q18readerEnd,

                @q19Id,
                @q19response,
                @q19inputMethods,
                @q19keystrokes,
                @q19score,
                @q19responseTime,
                @q19timeout,
                @q19timeoutResponse,
                @q19timeoutScore,
                @q19loadTime,
                @q19firstKey,
                @q19lastKey,
                @q19overallTime,
                @q19recallTime,
                @q19readerStart,
                @q19readerEnd,

                @q20Id,
                @q20response,
                @q20inputMethods,
                @q20keystrokes,
                @q20score,
                @q20responseTime,
                @q20timeout,
                @q20timeoutResponse,
                @q20timeoutScore,
                @q20loadTime,
                @q20firstKey,
                @q20lastKey,
                @q20overallTime,
                @q20recallTime,
                @q20readerStart,
                @q20readerEnd,

                @q21Id,
                @q21response,
                @q21inputMethods,
                @q21keystrokes,
                @q21score,
                @q21responseTime,
                @q21timeout,
                @q21timeoutResponse,
                @q21timeoutScore,
                @q21loadTime,
                @q21firstKey,
                @q21lastKey,
                @q21overallTime,
                @q21recallTime,
                @q21readerStart,
                @q21readerEnd,

                @q22Id,
                @q22response,
                @q22inputMethods,
                @q22keystrokes,
                @q22score,
                @q22responseTime,
                @q22timeout,
                @q22timeoutResponse,
                @q22timeoutScore,
                @q22loadTime,
                @q22firstKey,
                @q22lastKey,
                @q22overallTime,
                @q22recallTime,
                @q22readerStart,
                @q22readerEnd,

                @q23Id,
                @q23response,
                @q23inputMethods,
                @q23keystrokes,
                @q23score,
                @q23responseTime,
                @q23timeout,
                @q23timeoutResponse,
                @q23timeoutScore,
                @q23loadTime,
                @q23firstKey,
                @q23lastKey,
                @q23overallTime,
                @q23recallTime,
                @q23readerStart,
                @q23readerEnd,

                @q24Id,
                @q24response,
                @q24inputMethods,
                @q24keystrokes,
                @q24score,
                @q24responseTime,
                @q24timeout,
                @q24timeoutResponse,
                @q24timeoutScore,
                @q24loadTime,
                @q24firstKey,
                @q24lastKey,
                @q24overallTime,
                @q24recallTime,
                @q24readerStart,
                @q24readerEnd,

                @q25Id,
                @q25response,
                @q25inputMethods,
                @q25keystrokes,
                @q25score,
                @q25responseTime,
                @q25timeout,
                @q25timeoutResponse,
                @q25timeoutScore,
                @q25loadTime,
                @q25firstKey,
                @q25lastKey,
                @q25overallTime,
                @q25recallTime,
                @q25readerStart,
                @q25readerEnd);
        END
    `
    return sql
  }

  public async write (data: IPsychometricReportLine): Promise<IModifyResult> {
    const params = this.generateParams(data)
    const sql = this.generateSql(data)
    return this.sqlService.modify(sql, params)
  }
}
