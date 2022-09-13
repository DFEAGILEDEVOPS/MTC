import { MonotonicTime } from './monotonic-time';
import { WindowRefService } from './services/window-ref/window-ref.service'

describe('MonotonicDate', () => {
  let windowRefService: WindowRefService

  beforeEach(() => {
    windowRefService = new WindowRefService()
  })

  it('should create an instance', () => {
    const sequenceNumber = 1
    expect(new MonotonicTime(windowRefService, sequenceNumber)).toBeTruthy()
  })
})
