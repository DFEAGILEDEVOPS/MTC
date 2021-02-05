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

  function veryFakeUpn (): string {
    const r = Math.random()
    return 'F'.concat(Math.ceil(r * 1000000000).toString())
  }

  const samplePayload: IPsychometricReportLine = {
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
    TestDate: moment('2021-02-03T00:00:00Z'),
    TimeStart: moment().subtract(200, 'seconds'),
    TimeComplete: moment(),
    TimeTaken: 200.12,
    RestartNumber: 1,
    RestartReason: 1,
    FormMark: 2,
    DeviceID: null,
    DeviceTypeModel: null,
    DeviceType: null,
    BrowserType: null,
    answers: []
  }

  beforeAll(() => {
    sqlService = new SqlService()
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
  })

  afterAll(async () => {
    await sqlService.closePool()
  })
})
