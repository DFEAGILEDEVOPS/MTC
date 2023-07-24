import { type IUserInputService, UserInputService } from './user-input.service'
import { type ISqlService } from '../../sql/sql.service'

describe('UserInputService', () => {
  let sut: IUserInputService
  let mockSqlService: ISqlService

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new UserInputService(mockSqlService)
    jest.spyOn((sut as any), 'sqlGetUserInputLookupData').mockReturnValue(Promise.resolve([
      { id: 1, name: 'Mouse', code: 'M' },
      { id: 2, name: 'Keyboard', code: 'K' },
      { id: 3, name: 'Touch', code: 'T' },
      { id: 4, name: 'Pen', code: 'P' },
      { id: 5, name: 'Unknown', code: 'X' }
    ]))
  })

  test('it calls initialise on the first call', async () => {
    await sut.getUserInputLookupTypeId('mouse')
    expect((sut as any).initialised).toBe(true)
  })

  test('it only calls initialise() once', async () => {
    const initSpy = jest.spyOn((sut as any), 'initialise')
    await sut.getUserInputLookupTypeId('touch')
    await sut.getUserInputLookupTypeId('keyboard')
    expect(initSpy).toHaveBeenCalledTimes(1)
  })

  test('it returns the DB id for mouse input', async () => {
    const res = await sut.getUserInputLookupTypeId('mouse')
    expect(res).toBe(1)
  })

  test('it returns the DB id for keyboard input', async () => {
    const res = await sut.getUserInputLookupTypeId('keyboard')
    expect(res).toBe(2)
  })

  test('it returns the DB id for touch input', async () => {
    const res = await sut.getUserInputLookupTypeId('touch')
    expect(res).toBe(3)
  })

  test('it returns the DB id for pen input', async () => {
    const res = await sut.getUserInputLookupTypeId('pen')
    expect(res).toBe(4)
  })

  test('it returns an ID for known unknown input', async () => {
    const res = await sut.getUserInputLookupTypeId('unknown')
    expect(res).toBe(5)
  })

  test('it returns an ID for other unknown input', async () => {
    const res = await sut.getUserInputLookupTypeId('!@#$')
    expect(res).toBe(5)
  })
})
