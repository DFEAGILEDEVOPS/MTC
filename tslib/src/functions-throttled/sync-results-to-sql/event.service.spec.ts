import { type IEventService, EventService } from './event.service'
import { type ISqlService } from '../../sql/sql.service'

describe('EventService', () => {
  let sut: IEventService
  let mockSqlService: ISqlService
  let sqlSpy: jest.SpyInstance

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new EventService(mockSqlService)
    sqlSpy = jest.spyOn((sut as any), 'sqlGetEventTypes').mockReturnValueOnce(Promise.resolve([
      { id: 1, eventType: 'QuestionIntroRendered', eventDescription: '' },
      { id: 2, eventType: 'QuestionTimerStarted', eventDescription: '' },
      { id: 3, eventType: 'RefreshDetected', eventDescription: '' }
    ]))
  })

  test('it populates the event cache on first call', async () => {
    await sut.findOrCreateEventTypeId('RefreshDetected')
    await sut.findOrCreateEventTypeId('QuestionIntroRendered')
    expect(sqlSpy).toHaveBeenCalledTimes(1)
  })

  test('it returns the database ID of the event type, if it exists', async () => {
    const id = await sut.findOrCreateEventTypeId('RefreshDetected')
    expect(id).toBe(3)
  })

  test('it creates a new event if the event is not found', async () => {
    jest.spyOn((sut as any), 'createNewEventType')
    jest.spyOn((sut as any), 'refreshEventTypes')
    sqlSpy = jest.spyOn((sut as any), 'sqlGetEventTypes').mockReturnValueOnce(Promise.resolve([
      { id: 1, eventType: 'QuestionIntroRendered', eventDescription: '' },
      { id: 2, eventType: 'QuestionTimerStarted', eventDescription: '' },
      { id: 3, eventType: 'RefreshDetected', eventDescription: '' },
      { id: 4, eventType: 'ElectricBugaloo', eventDescription: '' }
    ]))
    const id = await sut.findOrCreateEventTypeId('ElectricBugaloo')
    expect((sut as any).createNewEventType).toHaveBeenCalledTimes(1)
    expect((sut as any).refreshEventTypes).toHaveBeenCalledTimes(2)
    expect(id).toBe(4)
  })
})
