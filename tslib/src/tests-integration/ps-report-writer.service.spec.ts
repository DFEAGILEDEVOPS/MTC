import { PsReportWriterService } from '../functions-throttled/ps-report-4-writer/ps-report-writer.service'
import { PsychometricReport } from '../functions-throttled/ps-report-4-writer/models'
import { IPsychometricReportLine } from '../functions/ps-report-3-transformer/models'
import moment from 'moment/moment'
import { SqlService } from '../sql/sql.service'
import { TYPES } from 'mssql'
import { v4 as uuidv4 } from 'uuid'
import * as R from 'ramda'

describe('ps report writer service integration test', () => {
  let sqlService: SqlService
  let samplePayload: IPsychometricReportLine

  function veryFakeUpn (): string {
    const r = Math.random()
    return 'F'.concat(Math.ceil(r * 1000000000).toString())
  }

  beforeAll(() => {
    sqlService = new SqlService()
    samplePayload = {
      DOB: moment('2010-11-21T00:00:00Z', true),
      Gender: 'M',
      PupilID: '',
      Forename: 'Forename',
      Surname: 'Surname',
      ReasonNotTakingCheck: null,
      PupilStatus: 'Completed',
      SchoolName: 'Smallville Primary School',
      Estab: 1001,
      SchoolURN: 8654321,
      LAnum: 999,
      QDisplayTime: 6.12,
      PauseLength: 3.45,
      AccessArr: '',
      AttemptID: uuidv4(),
      FormID: 'MTC001',
      TestDate: moment('2021-02-03T00:00:00.1234Z'),
      TimeStart: moment().subtract(200, 'seconds'),
      TimeComplete: moment(),
      TimeTaken: 200.123,
      RestartNumber: 1,
      RestartReason: 1,
      FormMark: 2,
      DeviceID: 'dev-1234-abcd',
      DeviceTypeModel: 'iPad 8.0',
      DeviceType: 'iPad',
      BrowserType: 'Chrome 82.1.100',
      answers: [
        {
          questionNumber: 1,
          id: '1x1',
          response: '1',
          inputMethods: 'M',
          keystrokes: 'm[1], m[Enter]',
          score: 1,
          firstKey: moment('2021-02-05T09:00:01.000Z'),
          lastKey: moment('2021-02-05T09:00:02.333Z'),
          responseTime: 1.345,
          timeout: false,
          timeoutResponse: true,
          timeoutScore: true,
          loadTime: moment('2021-02-05T09:00:01.000Z'),
          overallTime: 2.512,
          recallTime: 1.012,
          questionReaderStart: null,
          questionReaderEnd: null
        }
      ]
    }
  })

  async function getRow (pupilId: string): Promise<PsychometricReport | undefined> {
    const res: PsychometricReport[] = await sqlService.query('SELECT * FROM mtc_results.psychometricReport WHERE PupilId = @pupilId',
      [{ name: 'pupilId', value: pupilId, type: TYPES.NVarChar(32) }])
    return R.head(res)
  }

  test('we can insert the payload', async () => {
    const reportWriter = new PsReportWriterService()
    const upn = veryFakeUpn()
    const payload = R.assoc('PupilID', upn, samplePayload)
    await reportWriter.write(payload)
    const data = await getRow(upn)
    console.log('DATA retrieved', data)
    expect(data?.DOB?.toISOString()).toStrictEqual('2010-11-21T00:00:00.000Z')
    expect(data?.Gender).toBe('M')
    expect(data?.PupilId).toBe(upn)
    expect(data?.Forename).toBe('Forename')
    expect(data?.Surname).toBe('Surname')
    expect(data?.FormMark).toBe(2)
    expect(data?.QDisplayTime).toBe(6.12)
    expect(data?.PauseLength).toBe(3.45)
    expect(data?.AccessArr).toBe('')
    expect(data?.RestartReason).toBe(1)
    expect(data?.RestartNumber).toBe(1)
    expect(data?.ReasonNotTakingCheck).toBeNull()
    expect(data?.PupilStatus).toBe('Completed')
    expect(data?.DeviceType).toBe('iPad')
    expect(data?.DeviceTypeModel).toBe('iPad 8.0')
    expect(data?.DeviceId).toBe('dev-1234-abcd')
    expect(data?.BrowserType).toBe('Chrome 82.1.100')
    expect(data?.SchoolName).toBe('Smallville Primary School')
    expect(data?.Estab).toBe(1001)
    expect(data?.SchoolURN).toBe(8654321)
    expect(data?.LANum).toBe(999)
    expect(data?.AttemptId).toBe(payload.AttemptID.toUpperCase())
    expect(data?.FormID).toBe('MTC001')
    expect(data?.TestDate?.toISOString()).toBe('2021-02-03T00:00:00.000Z')
    expect(data?.TimeStart?.toISOString()).toBe(payload.TimeStart?.toISOString())
    expect(data?.TimeComplete?.toISOString()).toBe(payload.TimeComplete?.toISOString())
    expect(data?.TimeTaken).toBe(200.123)
    expect(data?.Q1ID).toBe('1x1')
    expect(data?.Q1Response).toBe('1')
    expect(data?.Q1InputMethods).toBe('M')
    expect(data?.Q1K).toBe(payload.answers[0].keystrokes)
    expect(data?.Q1Sco).toBe(payload.answers[0].score)
    expect(data?.Q1ResponseTime).toBe(payload.answers[0].responseTime)
    expect(data?.Q1TimeOut).toBe(Number(payload.answers[0].timeout))
    expect(data?.Q1TimeOutResponse).toBe(Number(payload.answers[0].timeoutResponse))
  })

  afterAll(async () => {
    await sqlService.closePool()
  })
})
