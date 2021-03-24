import { ISqlParameter, ISqlService, SqlService } from '../../sql/sql.service'
import { ConsoleLogger, ILogger } from '../../common/logger'
import { IPsychometricReportLine, IReportLineAnswer } from '../../functions/ps-report-3-transformer/models'
import { TYPES, MAX } from 'mssql'
import * as R from 'ramda'

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
      { name: 'id', value: data.PupilDatabaseId, type: TYPES.Int },
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
      { name: 'schoolName', value: data.SchoolName, type: TYPES.NVarChar(MAX) },
      { name: 'estab', value: data.Estab, type: TYPES.SmallInt },
      { name: 'schoolUrn', value: data.SchoolURN, type: TYPES.Int },
      { name: 'laNum', value: data.LAnum, type: TYPES.Int },
      { name: 'attemptId', value: data.AttemptID, type: TYPES.UniqueIdentifier },
      { name: 'formId', value: data.FormID, type: TYPES.NVarChar(64) },
      { name: 'testDate', value: data.TestDate?.toDate(), type: TYPES.Date },
      { name: 'timeStart', value: data.TimeStart?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeComplete', value: data.TimeComplete?.toDate(), type: TYPES.DateTimeOffset(3) },
      { name: 'timeTaken', value: data.TimeTaken, type: TYPES.Decimal(9, 3) }
    ]
    for (let i = 1; i <= 25; i++) {
      /* eslint-disable no-multi-spaces */
      params.push({ name: `q${i}Id`,              value: data.answers[i - 1]?.id,                            type: TYPES.NVarChar(16) })
      params.push({ name: `q${i}response`,        value: data.answers[i - 1]?.response,                      type: TYPES.NVarChar(60) })
      params.push({ name: `q${i}inputMethods`,    value: data.answers[i - 1]?.inputMethods,                  type: TYPES.NVarChar(16) })
      params.push({ name: `q${i}keystrokes`,      value: data.answers[i - 1]?.keystrokes,                    type: TYPES.NVarChar(256) })
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
        IF EXISTS ( SELECT * FROM [mtc_results].[psychometricReport] WHERE id = @id )
        BEGIN        
           UPDATE [mtc_results].[psychometricReport] 
           SET 
              PupilId = @pupilId, DOB = @dob, Gender = @gender, Forename = @forename, Surname = @surname, FormMark = @formMark, QDisplayTime = @qDisplayTime,
              PauseLength = @pauseLength, AccessArr = @accessArr, RestartReason = @restartReason, RestartNumber = @restartNumber, 
              ReasonNotTakingCheck = @ReasonNotTakingCheck, PupilStatus = @pupilStatus, DeviceType = @deviceType, 
              DeviceTypeModel = @deviceTypeModel, DeviceId = @deviceId, BrowserType = @browserType, SchoolName = @schoolName, Estab = @estab,
              SchoolURN = @schoolURN, LANum = @laNum, AttemptId = @attemptId, FormID = @formId, TestDate = @testDate, TimeStart = @timeStart,
              TimeComplete = @timeComplete, TimeTaken = @timeTaken,
             
              ${updateAnswers.join(',\n')}
                      
           WHERE id = @id;
        END
        ELSE 
        BEGIN
          INSERT into [mtc_results].[psychometricReport] (id, DOB, Gender, PupilId, Forename, Surname, FormMark, QDisplayTime, PauseLength,
                                                        AccessArr, RestartReason, RestartNumber, ReasonNotTakingCheck, PupilStatus,
                                                        DeviceType, DeviceTypeModel, DeviceId, BrowserType, SchoolName, Estab, SchoolURN,
                                                        LANum, AttemptId, FormID, TestDate, TimeStart, TimeComplete, TimeTaken,
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
        VALUES (@id,
                @dob,
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

  public async write (data: IPsychometricReportLine): Promise<void> {
    const params = this.generateParams(data)
    const sql = this.generateSql(data)
    return this.sqlService.modify(sql, params)
  }
}
