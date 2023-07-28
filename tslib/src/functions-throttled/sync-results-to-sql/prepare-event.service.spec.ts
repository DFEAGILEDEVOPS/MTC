import { type IPrepareEventService, PrepareEventService } from './prepare-event.service'
import { type IEventService } from './event.service'
import { type Audit } from './models'
import { type IQuestionService } from './question.service'

describe('PrepareEventService', () => {
  let sut: IPrepareEventService
  let mockEventService: IEventService
  let mockQuestionService: IQuestionService

  beforeEach(() => {
    mockEventService = {
      findOrCreateEventTypeId: jest.fn()
    }
    mockQuestionService = {
      findQuestion: jest.fn()
    }
    sut = new PrepareEventService(mockEventService, mockQuestionService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it calls findOrCreateEventTypeId', async () => {
    const audit: Audit = {
      type: 'unit-test',
      clientTimestamp: (new Date()).toISOString()
    }
    await sut.prepareEvent(audit, 'code', 42)
    expect(mockEventService.findOrCreateEventTypeId as any).toHaveBeenCalledTimes(1)
  })

  test('it prepares to insert null into the question_id col if the event does NOT relate to a question', async () => {
    const audit: Audit = {
      type: 'unit-test',
      clientTimestamp: (new Date()).toISOString()
    }
    const res = await sut.prepareEvent(audit, 'code', 43)
    const qIdParam = res.params.find(p => p.name === 'eventQuestionId43')
    // @ts-ignore If this is undefined the test will fail
    expect(qIdParam.value).toBeNull()
  })

  test('it prepares to insert a number into the question_id col if the event DOES relate to a valid question', async () => {
    const mockDBQuestion = {
      id: 99,
      factor1: 1,
      factor2: 1,
      code: 'Q001',
      isWarmup: false
    }
    const audit: Audit = {
      type: 'unit-test',
      clientTimestamp: (new Date()).toISOString(),
      data: {
        question: '1x1',
        sequenceNumber: 10,
        isWarmup: false
      }
    }
    jest.spyOn(mockQuestionService, 'findQuestion').mockResolvedValue(mockDBQuestion)
    const res = await sut.prepareEvent(audit, 'code', 44)
    const qIdParam = res.params.find(p => p.name === 'eventQuestionId44')
    const qNumParam = res.params.find(p => p.name === 'eventQuestionNumber44')
    // @ts-ignore If this is undefined the test will fail
    expect(qIdParam.value).toBe(99)
    // @ts-ignore If this is undefined the test will fail
    expect(qNumParam.value).toBe(10)
  })

  test('it prepares to insert NULL into the question_id col if the event relates to an INVALID question', async () => {
    const audit: Audit = {
      type: 'unit-test',
      clientTimestamp: (new Date()).toISOString(),
      data: {
        question: '13x13',
        sequenceNumber: 26,
        isWarmup: false
      }
    }
    jest.spyOn(mockQuestionService, 'findQuestion').mockRejectedValue(new Error('unit test'))
    jest.spyOn(console, 'error').mockReturnValue() // shush the console.error call
    const res = await sut.prepareEvent(audit, 'code', 45)
    const qIdParam = res.params.find(p => p.name === 'eventQuestionId45')
    const qNumParam = res.params.find(p => p.name === 'eventQuestionNumber45')
    // @ts-ignore If this is undefined the test will fail
    expect(qIdParam.value).toBeNull()
    // @ts-ignore If this is undefined the test will fail
    expect(qNumParam.value).toBeNull()
  })

  test('it does not setup a FK to the question table for warmup questions', async () => {
    const mockDBQuestion = {
      id: 99,
      factor1: 1,
      factor2: 1,
      code: 'W001',
      isWarmup: true
    }
    const audit: Audit = {
      type: 'unit-test',
      clientTimestamp: (new Date()).toISOString(),
      data: {
        question: '1x1',
        sequenceNumber: 2,
        isWarmup: true
      }
    }
    jest.spyOn(mockQuestionService, 'findQuestion').mockResolvedValue(mockDBQuestion)
    jest.spyOn(console, 'error').mockReturnValue() // shush the console.error call
    const res = await sut.prepareEvent(audit, 'code', 3)
    const qIdParam = res.params.find(p => p.name === 'eventQuestionId3')
    const qNumParam = res.params.find(p => p.name === 'eventQuestionNumber3')
    // @ts-ignore If this is undefined the test will fail
    expect(qIdParam.value).toBeNull()
    // @ts-ignore If this is undefined the test will fail
    expect(qNumParam.value).toBeNull()
  })
})
