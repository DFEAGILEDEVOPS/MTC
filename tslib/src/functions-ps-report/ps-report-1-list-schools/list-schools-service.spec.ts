import { ListSchoolsService } from './list-schools-service'
import { MockLogger } from '../../common/logger'
import { ISqlService } from '../../sql/sql.service'
import { IContextLike } from '../../common/ContextLike'

describe('ListSchoolsService', () => {
  let sut: ListSchoolsService
  let mockSqlService: ISqlService
  let mockContextLike: IContextLike

  const ContextLikeMock = jest.fn<IContextLike, any>(() => ({
    bindings: jest.fn(),
    log: new MockLogger()
  }))

  const mockResponse = [
    { id: 1, uuid: 'uuid1', name: 'School One' },
    { id: 2, uuid: 'uuid2', name: 'School Two' }
  ]

  beforeEach(() => {
    mockContextLike = new ContextLikeMock()
    mockSqlService = {
      query: jest.fn().mockResolvedValueOnce(mockResponse),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new ListSchoolsService(mockContextLike, mockSqlService)
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
