import { ListSchoolsService } from './list-schools-service'
import { ISqlService } from '../../sql/sql.service'
import { ILogger, MockLogger } from '../../common/logger'

describe('ListSchoolsService', () => {
  let sut: ListSchoolsService
  let mockSqlService: ISqlService
  let mockLogger: ILogger

  const mockResponse = [
    { id: 1, uuid: 'uuid1', name: 'School One' },
    { id: 2, uuid: 'uuid2', name: 'School Two' }
  ]

  beforeEach(() => {
    mockLogger = new MockLogger()
    mockSqlService = {
      query: jest.fn().mockResolvedValueOnce(mockResponse),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new ListSchoolsService(mockLogger, mockSqlService)
  })

  test('is defined', () => {
    expect(sut).toBeDefined()
  })

  test('getSchoolMessages returns messages', async () => {
    const resp = await sut.getSchoolMessages()
    expect(resp).toHaveLength(2)
    expect(resp[0].name).toBe('School One')
    expect(resp[0].uuid).toBe('uuid1')
    expect(resp[1].name).toBe('School Two')
    expect(resp[1].uuid).toBe('uuid2')
  })
})
