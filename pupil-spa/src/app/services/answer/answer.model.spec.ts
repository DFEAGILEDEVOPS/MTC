import { Answer } from './answer.model'
import { MonotonicTimeService } from '../monotonic-time/monotonic-time.service'
import { WindowRefService } from '../window-ref/window-ref.service'
import { MonotonicTime } from '../../monotonic-time'

describe('AnswerModel', () => {
  let monotonicTimeService: MonotonicTimeService
  let windowRefService: WindowRefService

  beforeEach(() =>{
    windowRefService = new WindowRefService()
    monotonicTimeService = new MonotonicTimeService(windowRefService)
  })

  it('constructs', () => {
    const mtime = monotonicTimeService.getMonotonicDateTime()
    const a = new Answer(1, 2, '3', 4, mtime, '1x2')
    expect(a instanceof Answer).toBeTruthy()
  })

  it('stores the constructor args as public properties', () => {
    const mtime = monotonicTimeService.getMonotonicDateTime()
    const a = new Answer(1, 2, '3', 4, mtime, '1x2')
    expect(a.factor1).toBe(1)
    expect(a.factor2).toBe(2)
    expect(a.sequenceNumber).toBe(4)
    expect(a.question).toBe('1x2')
    expect(a.clientTimestamp instanceof MonotonicTime).toBe(true)
  })
})
