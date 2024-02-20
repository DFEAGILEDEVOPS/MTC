import moment from 'moment'
import { CsvTransformer } from './csv-transformer'
import * as CSV from 'csv-string'

let sut: CsvTransformer

describe('CsvTransformer Class', () => {
  beforeEach(() => {
    const psReportLineData: any[] = [
      {
        PupilDatabaseId: 1,
        PupilUPN: 'upn',
        DOB: moment('2012-12-30'),
        Gender: 'F',
        Forename: 'forename',
        Surname: 'surname',
        FormMark: 25,
        QDisplayTime: 5.75,
        PauseLength: 3.14,
        AccessArr: 'accessArrangments',
        RestartReason: 'restartReason',
        RestartNumber: 1,
        PupilStatus: 'status',
        DeviceID: 'device ID',
        BrowserType: 'browserType',
        SchoolName: 'school name',
        Estab: '1234',
        SchoolURN: 'urn',
        LAnum: '999',
        AttemptID: 'attempt ID',
        FormID: 'form ID',
        TestDate: moment('2020-06-29'),
        TimeStart: moment('2020-06-29T07:49:35.637Z'),
        TimeComplete: moment('2020-06-29T07:49:35.637Z').add(2, 'minutes'),
        TimeTaken: 223.45,
        ReasonNotTakingCheck: 'reasonNotTakingCheck',
        ToECode: 'ToE code',
        ImportedFromCensus: true
      }
    ]
    sut = new CsvTransformer(psReportLineData)
  })

  test('it outputs the Pupil Id', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][0]).toBe('1') // the csv parser has converted this to a string.
  })

  test('it outputs the UPN', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][1]).toBe('upn')
  })

  test('it outputs the createdAt', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][2]).toMatch(/^\d{4}-\d{2}-\d{2}/)
  })

  test('it outputs the updatedAt', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][3]).toMatch(/^\d{4}-\d{2}-\d{2}/)
  })

  test('it outputs the DOB in ISO string', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][4]).toBe('2012-12-30')
  })

  test('it outputs the Gender', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][5]).toBe('F')
  })

  test('it outputs the forename', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][6]).toBe('forename')
  })

  test('it outputs the surname', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][7]).toBe('surname')
  })

  test('it outputs the mark', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][8]).toBe('25')
  })

  test('it outputs the max time the question could be displayed for', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][9]).toBe('5.75')
  })

  test('it outputs the pause length between questions', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][10]).toBe('3.14')
  })

  test('it outputs the access arrangements', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][11]).toBe('accessArrangments')
  })

  test('it outputs the restart reason', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][12]).toBe('restartReason')
  })

  test('it outputs the restart number', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][13]).toBe('1')
  })

  test('it outputs the pupil status', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][14]).toBe('status')
  })

  test('it outputs the device ID', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][15]).toBe('device ID')
  })

  test('it outputs the browser type', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][16]).toBe('browserType')
  })

  test('it outputs the school name', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][17]).toBe('school name')
  })

  test('it outputs the estab', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][18]).toBe('1234')
  })

  test('it outputs the school urn', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][19]).toBe('urn')
  })

  test('it outputs the LA number', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][20]).toBe('999')
  })

  test('it outputs the Attempt ID', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][21]).toBe('attempt ID')
  })

  test('it outputs the Form ID', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][22]).toBe('form ID')
  })

  test('it outputs the test date', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][23]).toBe('2020-06-29')
  })

  test('it outputs the time start', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][24]).toBe('2020-06-29T07:49:35.637Z')
  })

  test('it outputs the time complete', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][25]).toBe('2020-06-29T07:51:35.637Z')
  })

  test('it outputs the time taken', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][26]).toBe('223.45')
  })

  test('it outputs the reason for not taking check', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][27]).toBe('reasonNotTakingCheck')
  })

  test('it outputs the ToE code', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][28]).toBe('ToE code')
  })

  test('it outputs the imported from census flag', () => {
    const s = sut.transform()
    const res = CSV.parse(s)
    expect(res[0][29]).toBe('1')
  })
})
