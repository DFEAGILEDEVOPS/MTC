/* eslint-disable @typescript-eslint/dot-notation */
import * as R from 'ramda'
import { mockCompletionCheckMessage } from './mocks/completed-check.message'
import { SyncResultsDataService } from './sync-results.data.service'
import { ISqlService } from '../../sql/sql.service'
import { DBEventType } from './models'

const mockQuestionData = new Map()
mockQuestionData.set('1x1', { id: 1, factor1: 1, factor2: 2, isWarmup: false, code: 'Q001' })
const validatedCheck = mockCompletionCheckMessage.validatedCheck
let mockSqlService: ISqlService

describe('SyncResultsDataService', () => {
  let sut: SyncResultsDataService
  let date: Date

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new SyncResultsDataService(mockSqlService)
    date = new Date()
  })

  it('calls `createNewEvent` if a new event is seen in the audit log when preparing events', async () => {
    // setup
    const eventTypes = new Map<string, DBEventType>()
    eventTypes.set('TestEvent1', { id: 1, eventType: 'TestEvent1', eventDescription: '' })
    eventTypes.set('TestEvent2', { id: 1, eventType: 'TestEvent2', eventDescription: '' })

    jest.spyOn(sut as any, 'createNewEventType').mockImplementation(jest.fn())
    jest.spyOn(sut as any, 'refreshEventTypes')
      .mockImplementationOnce(() => {
        // call 1: 2 event types
        sut['eventType'] = eventTypes
      })
      .mockImplementationOnce(() => {
        // call 2 - now the new event should be added
        eventTypes.set('TestEvent3', { id: 3, eventType: 'TestEvent3', eventDescription: '' })
        sut['eventType'] = eventTypes
      })

    jest.spyOn(sut, 'sqlGetQuestionData').mockReturnValueOnce(Promise.resolve(mockQuestionData))
    const vc = R.clone(validatedCheck)
    vc.audit = [] // we don't want to have to mock the entire event type lookup
    vc.audit.push({ type: 'TestEvent1', clientTimestamp: date.toISOString() })
    vc.audit.push({ type: 'TestEvent2', clientTimestamp: date.toISOString() })
    const someNewEvent = { type: 'TestEvent3', clientTimestamp: date.toISOString() }
    vc.audit.unshift(someNewEvent) // add this to the beginning

    // test
    await sut.prepareEvents(vc)

    // expectations
    expect(sut['createNewEventType'] as jest.Mock).toHaveBeenCalledTimes(1)
    expect(sut['createNewEventType'] as jest.Mock).toHaveBeenCalledWith('TestEvent3')
  })

  it('extracts the questionNumber and question from the event if present', async () => {
    jest.spyOn(sut, 'sqlGetQuestionData').mockResolvedValue(mockQuestionData)
    const vc = R.clone(validatedCheck)
    vc.audit = [] // we don't want to have to mock the entire event type lookup
    vc.audit.push({ type: 'TestEvent1', clientTimestamp: date.toISOString(), data: { question: '1x1', sequenceNumber: 8 } })
    vc.audit.push({ type: 'TestEvent2', clientTimestamp: date.toISOString(), data: { question: '1x2', sequenceNumber: 9 } })
    jest.spyOn(sut as any, 'findEventTypeId').mockResolvedValueOnce(1).mockReturnValueOnce(2)
    jest.spyOn(sut as any, 'findQuestion').mockReturnValueOnce({ id: 3 }).mockReturnValueOnce({ id: 4 })

    const trans = await sut.prepareEvents(vc)
    expect(sut['findQuestion'] as jest.Mock).toHaveBeenCalledTimes(2)
    // expect a param called `questionId0` set to 1
    const pq0 = trans.params.find(o => o.name === 'questionId0')
    if (pq0 === undefined) fail('could not find question')
    expect(pq0.value).toBe(3)
    // expect a param called `questionId1` set to 2
    const pq1 = trans.params.find(o => o.name === 'questionId1')
    if (pq1 === undefined) fail('could not find question')
    expect(pq1.value).toBe(4)
  })

  it('sqlGetQuestionData returns a map indexed by question', async () => {
    jest.spyOn(sut['sqlService'], 'query').mockResolvedValue([{ id: 1, factor1: 1, factor2: 1, code: 'Q001', isWarmup: false }])

    // test
    const res = await sut.sqlGetQuestionData()

    // expect
    expect(res).toBeTruthy()
    // we expect it to be a map
    expect(res.size).toBe(1)
    expect(res.has('1x1')).toBe(true)
    expect(res.get('1x1')).toEqual({ id: 1, factor1: 1, factor2: 1, code: 'Q001', isWarmup: false })
  })

  it('sqlGetQuestionData caches data so it does not need to keep fetching the same data', async () => {
    jest.spyOn(sut['sqlService'], 'query').mockResolvedValue([{ id: 1, factor1: 1, factor2: 1, code: 'Q001', isWarmup: false }])

    const r1 = await sut.sqlGetQuestionData()
    const r2 = await sut.sqlGetQuestionData()

    expect(sut['sqlService'].query as jest.Mock).toHaveBeenCalledTimes(1)
    expect(r1).toEqual(r2)
  })
})
