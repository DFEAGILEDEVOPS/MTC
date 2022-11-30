import { Answer } from './answer.model'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { WindowRefService } from '../window-ref/window-ref.service'

describe('AnswerModel', () => {
  let monotonicTimeService: MonotonicTimeService
  let windowRefService: WindowRefService

  beforeEach(() =>{
    windowRefService = new WindowRefService()
    monotonicTimeService = new MonotonicTimeService(windowRefService)
  })

  it('constructs', () => {
    const mtime = monotonicTimeService.getMonotonicDateTime()
    const a = new Answer(1,
      2,
      '3',
      4,
      mtime.formatAsDate(),
      mtime.getDto(),
      '1x2')
    expect(a instanceof Answer).toBeTruthy()
  })

  it('stores the constructor args as public properties', () => {
    const mtime = monotonicTimeService.getMonotonicDateTime()
    const a = new Answer(
      1,
      2,
      '3',
      4,
      mtime.formatAsDate(),
      mtime.getDto(),
      '1x2')
    expect(a.factor1).toBe(1)
    expect(a.factor2).toBe(2)
    expect(a.sequenceNumber).toBe(4)
    expect(a.question).toBe('1x2')
    expect(a.clientTimestamp.constructor.name).toBe('Date')
    expect(typeof a.monotonicTime.milliseconds).toBe('number')
    expect(typeof a.monotonicTime.sequenceNumber).toBe('number')
    expect(a.monotonicTime.legacyDate.constructor.name).toBe('Date')
  })
})
