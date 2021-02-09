import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { IPsychometricReportLine } from '../../functions/ps-report-3-transformer/models'
import { TYPES } from 'mssql'

export class PsReportWriterService {
  private readonly sqlService: ISqlService
  private readonly logger: ILogger

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

  private generateParams (data: IPsychometricReportLine): ISqlParameter[] {
    return [
      { name: 'dob', value: data.DOB?.toDate(), type: TYPES.Date },
      { name: 'gender', value: data.Gender, type: TYPES.Char(1) },
      { name: 'pupilId', value: data.PupilID, type: TYPES.NVarChar(32) },
      { name: 'forename', value: data.Forename, type: TYPES.NVarChar(128) },
      { name: 'surname', value: data.Surname, type: TYPES.NVarChar(128) },
      { name: 'formMark', value: data.FormMark, type: TYPES.Int },
      { name: 'qDisplayTime', value: data.QDisplayTime, type: TYPES.Decimal(5, 2) },
      { name: 'pauseLength', value: data.PauseLength, type: TYPES.Decimal(5, 2) },
      { name: 'accessArr', value: data.AccessArr, type: TYPES.NVarChar(128) },
      { name: 'restartReason', value: data.RestartReason, type: TYPES.SmallInt },
      { name: 'restartNumber', value: data.RestartNumber, type: TYPES.Int },
      { name: 'reasonNotTakingCheck', value: data.ReasonNotTakingCheck, type: TYPES.Int },
      { name: 'pupilStatus', value: data.PupilStatus, type: TYPES.NVarChar(32) },
      { name: 'deviceType', value: data.DeviceType, type: TYPES.NVarChar(32) },
      { name: 'deviceTypeModel', value: data.DeviceTypeModel, type: TYPES.NVarChar(32) },
      { name: 'deviceId', value: data.DeviceID, type: TYPES.NVarChar(128) },
      { name: 'browserType', value: data.BrowserType, type: TYPES.NVarChar(128) },
      { name: 'schoolName', value: data.SchoolName, type: TYPES.NVarChar(50) },
      { name: 'estab', value: data.Estab, type: TYPES.SmallInt },
      { name: 'schoolUrn', value: data.SchoolURN, type: TYPES.Int },
      { name: 'laNum', value: data.LAnum, type: TYPES.Int },
      { name: 'attemptId', value: data.AttemptID, type: TYPES.UniqueIdentifier },
      { name: 'formId', value: data.FormID, type: TYPES.NVarChar(64) },
      { name: 'testDate', value: data.TestDate?.toDate(), type: TYPES.Date },
      { name: 'timeStart', value: data.TimeStart?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeComplete', value: data.TimeComplete?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeTaken', value: data.TimeTaken, type: TYPES.Decimal(9, 3) },
      // Question 1
      { name: 'q1Id', value: data.answers[0]?.id, type: TYPES.NVarChar(16) },
      { name: 'q1Response', value: data.answers[0]?.response, type: TYPES.Int },
      { name: 'q1InputMethods', value: data.answers[0]?.inputMethods, type: TYPES.NVarChar(16) },
      { name: 'q1keystrokes', value: data.answers[0]?.keystrokes, type: TYPES.NVarChar },
      { name: 'q1score', value: data.answers[0].score, type: TYPES.TinyInt },
      { name: 'q1responseTime', value: data.answers[0].responseTime, type: TYPES.Decimal(7, 3) },
      { name: 'q1timeout', value: data.answers[0].timeout, type: TYPES.TinyInt },
      { name: 'q1timeoutResponse', value: data.answers[0].timeoutResponse, type: TYPES.TinyInt }
    ]
  }

  private generateSql (data: IPsychometricReportLine): string {
    const sql = `
        INSERT into [mtc_results].[psychometricReport] (DOB, Gender, PupilId, Forename, Surname, FormMark, QDisplayTime, PauseLength,
                                                        AccessArr, RestartReason, RestartNumber, ReasonNotTakingCheck, PupilStatus,
                                                        DeviceType, DeviceTypeModel, DeviceId, BrowserType, SchoolName, Estab, SchoolURN,
                                                        LANum, AttemptId, FormID, TestDate, TimeStart, TimeComplete, TimeTaken
                                                        ,Q1ID, Q1Response, Q1InputMethods, Q1K, Q1Sco, Q1ResponseTime, Q1TimeOut
                                                        ,Q1TimeOutResponse
--                                                          Q1TimeOutSco, Q1tLoad, Q1tFirstKey, Q1tLastKey, Q1OverallTime,
--                                                         Q1RecallTime, Q1ReaderStart, Q1ReaderEnd, Q2ID, Q2Response, Q2InputMethods, Q2K,
--                                                         Q2Sco, Q2ResponseTime, Q2TimeOut, Q2TimeOutResponse, Q2TimeOutSco, Q2tLoad,
--                                                         Q2tFirstKey, Q2tLastKey, Q2OverallTime, Q2RecallTime, Q2ReaderStart, Q2ReaderEnd,
--                                                         Q3ID, Q3Response, Q3InputMethods, Q3K, Q3Sco, Q3ResponseTime, Q3TimeOut,
--                                                         Q3TimeOutResponse, Q3TimeOutSco, Q3tLoad, Q3tFirstKey, Q3tLastKey, Q3OverallTime,
--                                                         Q3RecallTime, Q3ReaderStart, Q3ReaderEnd, Q4ID, Q4Response, Q4InputMethods, Q4K,
--                                                         Q4Sco, Q4ResponseTime, Q4TimeOut, Q4TimeOutResponse, Q4TimeOutSco, Q4tLoad,
--                                                         Q4tFirstKey, Q4tLastKey, Q4OverallTime, Q4RecallTime, Q4ReaderStart, Q4ReaderEnd,
--                                                         Q5ID, Q5Response, Q5InputMethods, Q5K, Q5Sco, Q5ResponseTime, Q5TimeOut,
--                                                         Q5TimeOutResponse, Q5TimeOutSco, Q5tLoad, Q5tFirstKey, Q5tLastKey, Q5OverallTime,
--                                                         Q5RecallTime, Q5ReaderStart, Q5ReaderEnd, Q6ID, Q6Response, Q6InputMethods, Q6K,
--                                                         Q6Sco, Q6ResponseTime, Q6TimeOut, Q6TimeOutResponse, Q6TimeOutSco, Q6tLoad,
--                                                         Q6tFirstKey, Q6tLastKey, Q6OverallTime, Q6RecallTime, Q6ReaderStart, Q6ReaderEnd,
--                                                         Q7ID, Q7Response, Q7InputMethods, Q7K, Q7Sco, Q7ResponseTime, Q7TimeOut,
--                                                         Q7TimeOutResponse, Q7TimeOutSco, Q7tLoad, Q7tFirstKey, Q7tLastKey, Q7OverallTime,
--                                                         Q7RecallTime, Q7ReaderStart, Q7ReaderEnd, Q8ID, Q8Response, Q8InputMethods, Q8K,
--                                                         Q8Sco, Q8ResponseTime, Q8TimeOut, Q8TimeOutResponse, Q8TimeOutSco, Q8tLoad,
--                                                         Q8tFirstKey, Q8tLastKey, Q8OverallTime, Q8RecallTime, Q8ReaderStart, Q8ReaderEnd,
--                                                         Q9ID, Q9Response, Q9InputMethods, Q9K, Q9Sco, Q9ResponseTime, Q9TimeOut,
--                                                         Q9TimeOutResponse, Q9TimeOutSco, Q9tLoad, Q9tFirstKey, Q9tLastKey, Q9OverallTime,
--                                                         Q9RecallTime, Q9ReaderStart, Q9ReaderEnd, Q10ID, Q10Response, Q10InputMethods, Q10K,
--                                                         Q10Sco, Q10ResponseTime, Q10TimeOut, Q10TimeOutResponse, Q10TimeOutSco, Q10tLoad,
--                                                         Q10tFirstKey, Q10tLastKey, Q10OverallTime, Q10RecallTime, Q10ReaderStart,
--                                                         Q10ReaderEnd, Q11ID, Q11Response, Q11InputMethods, Q11K, Q11Sco, Q11ResponseTime,
--                                                         Q11TimeOut, Q11TimeOutResponse, Q11TimeOutSco, Q11tLoad, Q11tFirstKey, Q11tLastKey,
--                                                         Q11OverallTime, Q11RecallTime, Q11ReaderStart, Q11ReaderEnd, Q12ID, Q12Response,
--                                                         Q12InputMethods, Q12K, Q12Sco, Q12ResponseTime, Q12TimeOut, Q12TimeOutResponse,
--                                                         Q12TimeOutSco, Q12tLoad, Q12tFirstKey, Q12tLastKey, Q12OverallTime, Q12RecallTime,
--                                                         Q12ReaderStart, Q12ReaderEnd, Q13ID, Q13Response, Q13InputMethods, Q13K, Q13Sco,
--                                                         Q13ResponseTime, Q13TimeOut, Q13TimeOutResponse, Q13TimeOutSco, Q13tLoad,
--                                                         Q13tFirstKey, Q13tLastKey, Q13OverallTime, Q13RecallTime, Q13ReaderStart,
--                                                         Q13ReaderEnd, Q14ID, Q14Response, Q14InputMethods, Q14K, Q14Sco, Q14ResponseTime,
--                                                         Q14TimeOut, Q14TimeOutResponse, Q14TimeOutSco, Q14tLoad, Q14tFirstKey, Q14tLastKey,
--                                                         Q14OverallTime, Q14RecallTime, Q14ReaderStart, Q14ReaderEnd, Q15ID, Q15Response,
--                                                         Q15InputMethods, Q15K, Q15Sco, Q15ResponseTime, Q15TimeOut, Q15TimeOutResponse,
--                                                         Q15TimeOutSco, Q15tLoad, Q15tFirstKey, Q15tLastKey, Q15OverallTime, Q15RecallTime,
--                                                         Q15ReaderStart, Q15ReaderEnd, Q16ID, Q16Response, Q16InputMethods, Q16K, Q16Sco,
--                                                         Q16ResponseTime, Q16TimeOut, Q16TimeOutResponse, Q16TimeOutSco, Q16tLoad,
--                                                         Q16tFirstKey, Q16tLastKey, Q16OverallTime, Q16RecallTime, Q16ReaderStart,
--                                                         Q16ReaderEnd, Q17ID, Q17Response, Q17InputMethods, Q17K, Q17Sco, Q17ResponseTime,
--                                                         Q17TimeOut, Q17TimeOutResponse, Q17TimeOutSco, Q17tLoad, Q17tFirstKey, Q17tLastKey,
--                                                         Q17OverallTime, Q17RecallTime, Q17ReaderStart, Q17ReaderEnd, Q18ID, Q18Response,
--                                                         Q18InputMethods, Q18K, Q18Sco, Q18ResponseTime, Q18TimeOut, Q18TimeOutResponse,
--                                                         Q18TimeOutSco, Q18tLoad, Q18tFirstKey, Q18tLastKey, Q18OverallTime, Q18RecallTime,
--                                                         Q18ReaderStart, Q18ReaderEnd, Q19ID, Q19Response, Q19InputMethods, Q19K, Q19Sco,
--                                                         Q19ResponseTime, Q19TimeOut, Q19TimeOutResponse, Q19TimeOutSco, Q19tLoad,
--                                                         Q19tFirstKey, Q19tLastKey, Q19OverallTime, Q19RecallTime, Q19ReaderStart,
--                                                         Q19ReaderEnd, Q20ID, Q20Response, Q20InputMethods, Q20K, Q20Sco, Q20ResponseTime,
--                                                         Q20TimeOut, Q20TimeOutResponse, Q20TimeOutSco, Q20tLoad, Q20tFirstKey, Q20tLastKey,
--                                                         Q20OverallTime, Q20RecallTime, Q20ReaderStart, Q20ReaderEnd, Q21ID, Q21Response,
--                                                         Q21InputMethods, Q21K, Q21Sco, Q21ResponseTime, Q21TimeOut, Q21TimeOutResponse,
--                                                         Q21TimeOutSco, Q21tLoad, Q21tFirstKey, Q21tLastKey, Q21OverallTime, Q21RecallTime,
--                                                         Q21ReaderStart, Q21ReaderEnd, Q22ID, Q22Response, Q22InputMethods, Q22K, Q22Sco,
--                                                         Q22ResponseTime, Q22TimeOut, Q22TimeOutResponse, Q22TimeOutSco, Q22tLoad,
--                                                         Q22tFirstKey, Q22tLastKey, Q22OverallTime, Q22RecallTime, Q22ReaderStart,
--                                                         Q22ReaderEnd, Q23ID, Q23Response, Q23InputMethods, Q23K, Q23Sco, Q23ResponseTime,
--                                                         Q23TimeOut, Q23TimeOutResponse, Q23TimeOutSco, Q23tLoad, Q23tFirstKey, Q23tLastKey,
--                                                         Q23OverallTime, Q23RecallTime, Q23ReaderStart, Q23ReaderEnd, Q24ID, Q24Response,
--                                                         Q24InputMethods, Q24K, Q24Sco, Q24ResponseTime, Q24TimeOut, Q24TimeOutResponse,
--                                                         Q24TimeOutSco, Q24tLoad, Q24tFirstKey, Q24tLastKey, Q24OverallTime, Q24RecallTime,
--                                                         Q24ReaderStart, Q24ReaderEnd, Q25ID, Q25Response, Q25InputMethods, Q25K, Q25Sco,
--                                                         Q25ResponseTime, Q25TimeOut, Q25TimeOutResponse, Q25TimeOutSco, Q25tLoad,
--                                                         Q25tFirstKey, Q25tLastKey, Q25OverallTime, Q25RecallTime, Q25ReaderStart,
--                                                         Q25ReaderEnd
                                                        )
        VALUES (@dob,
                @gender,
                @pupilId,
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
                @deviceType,
                @deviceTypeModel,
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
                @q1Id,
                @q1Response,
                @q1InputMethods,
                @q1keystrokes,
                @q1score,
                @q1responseTime,
                @q1timeout,
                @q1timeoutResponse)
    `
    return sql
  }

  public async write (data: IPsychometricReportLine): Promise<void> {
    console.log(data)
    const params = this.generateParams(data)
    const sql = this.generateSql(data)
    return this.sqlService.modify(sql, params)
  }
}
