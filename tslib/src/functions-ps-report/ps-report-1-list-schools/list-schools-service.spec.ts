import { ListSchoolsService } from './list-schools-service'
import { ISqlService } from '../../sql/sql.service'
import { IPsReportLogger } from '../common/ps-report-logger'

describe('ListSchoolsService', () => {
  let sut: ListSchoolsService
  let mockSqlService: ISqlService
  let mockPsLogger: IPsReportLogger

  const PsReportLoggerMock = jest.fn<IPsReportLogger, any>(() => ({
    error: jest.fn(),
    info: jest.fn(),
    verbose: jest.fn(),
    warn: jest.fn()
  }))

  const mockResponse = [
    { id: 1, uuid: 'uuid1', name: 'School One' },
    { id: 2, uuid: 'uuid2', name: 'School Two' }
  ]

  beforeEach(() => {
    mockPsLogger = new PsReportLoggerMock()
    mockSqlService = {
      query: jest.fn().mockResolvedValueOnce(mockResponse),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new ListSchoolsService(mockPsLogger, mockSqlService)
  })

  test('is defined', () => {
    expect(sut).toBeDefined()
  })

  test('getSchoolMessages returns messages', async () => {
    const resp = await sut.getSchoolMessages()
    console.log(resp)
    expect(resp).toHaveLength(2)
    expect(resp[0].name).toBe('School One')
    expect(resp[0].uuid).toBe('uuid1')
    expect(resp[1].name).toBe('School Two')
    expect(resp[1].uuid).toBe('uuid2')
  })
})
