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

  describe('set', () => {
    it('the monotonic time can be set to a desired state', () => {
      const mtime= service.getMonotonicDateTime()
      const dto = mtime.getDto()
      const m2time = service.getMonotonicDateTime()
      m2time.set(dto.legacyDate, dto.milliseconds, dto.sequenceNumber)
      expect(m2time.getLegacyDate().toISOString()).toEqual(mtime.getLegacyDate().toISOString())
      expect(m2time.getSequenceNumber()).toEqual(mtime.getSequenceNumber())
      expect(m2time.getDto().milliseconds).toEqual(mtime.getDto().milliseconds)
    })
  })

  describe('MonotonicTime class has a comparator function that sorts in ascending order', () => {
    it('sorts in ascending order using the legacy date as primary and sequenceNumber as secondary', () => {
      const m1 = service.getMonotonicDateTime()
      const d1 = new Date('2023-01-01T12:00:00')
      const d2 = new Date()
      m1.set(d1, d1.valueOf(), m1.getSequenceNumber()) // set it in the past a little, in order to test the primary sort
      const m2 = service.getMonotonicDateTime()
      m2.set(d2, d2.valueOf(), m2.getSequenceNumber()) // m2 and m3 have the same date, but different sequence numbers
      const m3 = service.getMonotonicDateTime()
      m3.set(d2, d2.valueOf(), m3.getSequenceNumber())
      const mtimes = [m3, m2, m1] // not sorted
      mtimes.sort(MonotonicTime.comparator) // now sorted
      expect(mtimes[0]).toBe(m1)
      expect(mtimes[1]).toBe(m2)
      expect(mtimes[2]).toBe(m3)
    })
  })
})
