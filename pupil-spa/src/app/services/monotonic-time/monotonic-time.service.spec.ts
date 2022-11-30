import { MonotonicTime } from '../../monotonic-time'
import { MonotonicTimeService } from './monotonic-time.service'
import { TestBed } from '@angular/core/testing'
import { WindowRefService } from '../window-ref/window-ref.service'

describe('MonotonicTimeService', () => {
  let service: MonotonicTimeService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ WindowRefService ]
    })
    service = TestBed.inject(MonotonicTimeService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getMonotonicDateTime()', () => {
    it('returns a MonotonicTime object', () => {
      const mt = service.getMonotonicDateTime()
      expect(mt instanceof MonotonicTime).toBeTruthy()
    })

    it('increments the sequenceNumber for each call', () => {
      const m1 = service.getMonotonicDateTime()
      const m2 = service.getMonotonicDateTime()
      const m3 = service.getMonotonicDateTime()
      expect(m1.getSequenceNumber()).toBe(0)
      expect(m2.getSequenceNumber()).toBe(1)
      expect(m3.getSequenceNumber()).toBe(2)
    })
  })
})
