import { PsReportWriterService } from '../functions-throttled/ps-report-4-writer/ps-report-writer.service'
import moment from 'moment/moment'
import { IPsychometricReportLine } from '../functions/ps-report-3-transformer/models'
import { SqlService } from '../sql/sql.service'
import { TYPES } from 'mssql'
import { v4 as uuidv4 } from 'uuid'

describe('ps report writer service integration test', () => {
  let sqlService: SqlService
  const payload: IPsychometricReportLine = {
    DOB: moment('2010-11-21T00:00:00Z', true),
    Gender: 'M',
    PupilID: 'K841220301111',
    Forename: 'Forename',
    Surname: 'Surname',
    ReasonNotTakingCheck: null,
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

  async function deleteRow (sid: string): Promise<any> {
    //     const params = [
    //   { name: 'id', value: sid, type: TYPES.NVarChar(32) }
    // ]
    // return sqlService.modify('delete from mtc_results.psychometricReport where PupilId = @id', params)
  }

  beforeAll(() => {
    sqlService = new SqlService()
  })

  test('we can insert the payload', async () => {
    const reportWriter = new PsReportWriterService()
    await deleteRow(payload.PupilID) // TODO add perms if we want this or UPDATE
    await reportWriter.write(payload)
    const res = await sqlService.query('SELECT * FROM mtc_results.psychometricReport WHERE PupilId = @pupilId',
      [{ name: 'pupilId', value: payload.PupilID, type: TYPES.NVarChar(32) }])
    const data = res[0]
    console.log('Data retrieved: ', data)
    expect(data.DOB.toISOString()).toStrictEqual('2010-11-21T00:00:00.000Z')
  })

  afterAll(async () => {
    await sqlService.closePool()
  })
})
