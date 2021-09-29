import { SchoolImportService } from './school-import.service'
import { ConnectionPool } from 'mssql'
import config from '../../config'
import { SchoolImportJobResult } from './SchoolImportJobResult'
import { ISchoolDataService } from './data-access/school.data.service'
import { SchoolImportError } from './SchoolImportError'
import { ConsoleLogger } from '../../common/logger'

let sut: SchoolImportService
let jobResult: SchoolImportJobResult
let schoolDataServiceMock: ISchoolDataService

const SchoolDataServiceMock = jest.fn<ISchoolDataService, any>(() => ({
  bulkUpload: jest.fn(),
  getJobId: jest.fn(),
  updateJobStatus: jest.fn(),
  updateJobStatusWithResult: jest.fn(),
  updateJobStatusWithResultAndError: jest.fn()
}))

describe('#SchoolImportService', () => {
  beforeEach(() => {
    schoolDataServiceMock = new SchoolDataServiceMock()
    jobResult = new SchoolImportJobResult()
    sut = new SchoolImportService(new ConnectionPool(config.Sql), jobResult, new ConsoleLogger(), schoolDataServiceMock)
    // quieten down the console logs
    // jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('is defined', () => {
    expect(sut).toBeInstanceOf(SchoolImportService)
  })

  test('if mapping fails error details are added to job output', async () => {
    try {
      await sut.process('')
      fail('mapping should have failed due to no data')
    } catch (error) {
      expect(error).toBeInstanceOf(SchoolImportError)
      expect(error.jobResult).toBeDefined()
      expect((error as SchoolImportError).jobResult.getErrorOutput()).toContain('Failed to map columns')
    }
  })

  test('data service job results should be appended to existing job result object', async () => {
    const csv = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code)
    12345,123,4567,My School,9,9,4,3,4`
    const retainedMessage = 'foo'
    // eslint-disable-next-line @typescript-eslint/dot-notation
    sut['jobResult'].stdout.push(retainedMessage)
    const jobResult = await sut.process(csv)
    expect(jobResult.stdout.shift()).toStrictEqual(retainedMessage)
  })

  test('data is filtered and persisted when valid', async () => {
    const csv = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code)
    12345,123,4567,My School,9,9,4,3,4`
    const jobResult = await sut.process(csv)
    expect(jobResult).toBeInstanceOf(SchoolImportJobResult)
    expect(jobResult.getErrorOutput()).toHaveLength(0)
  })

  test('when missing header error occurs, only 1 entry is logged to error output', async () => {
    const csv = '12345,123,4567,My School,9,9,4,3,4'
    try {
      await sut.process(csv)
      fail('should have thrown due to no column header row')
    } catch (error) {
      expect(error).toBeInstanceOf(SchoolImportError)
      const jobResult = (error as SchoolImportError).jobResult
      expect(jobResult.stderr).toHaveLength(1)
      expect(jobResult.stdout).toHaveLength(0)
    }
  })

  test('when predicate matches fail all records, it reports and exits', async () => {
    const csv = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code)
    12345,0,4567,My School,9,9,4,3,4`
    const jobResult = await sut.process(csv)
    expect(jobResult).toBeInstanceOf(SchoolImportJobResult)
    expect(jobResult.getErrorOutput()).toHaveLength(0)
    expect(jobResult.stdout).toHaveLength(2)
    expect(jobResult.stdout[1]).toStrictEqual('school records excluded in filtering:1. No records to persist, exiting.')
    expect(schoolDataServiceMock.bulkUpload).toHaveBeenCalledTimes(0)
  })

  test('does not import schools without a name', async () => {
    const csv = `URN,LA (code),EstablishmentNumber,EstablishmentName,StatutoryLowAge,StatutoryHighAge,EstablishmentStatus (code),TypeOfEstablishment (code),EstablishmentTypeGroup (code)
\n99900,999,9000,Guys School 1,8,10,1,7,4\n99901,999,9001,,8,10,1,7,4\n99902,999,9002,Guys Closed School,8,10,2,7,4`
    jest.spyOn(schoolDataServiceMock, 'bulkUpload').mockImplementation()
    await sut.process(csv)
    expect(schoolDataServiceMock.bulkUpload).toHaveBeenCalledTimes(1)
  })

  test('throws an error if the csv does not have a header row', async () => {
    const csv = ''
    jest.spyOn(schoolDataServiceMock, 'bulkUpload').mockImplementation()
    try {
      await sut.process(csv)
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('no header row found')
    }
  })
})
