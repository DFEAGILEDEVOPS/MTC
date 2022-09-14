import { MonotonicTime } from './monotonic-time';

describe('MonotonicTime', () => {
  let mockWindowRefService
  const mockDate = new Date('2022-01-01T09:00:00.000Z') // 1641027600000 ms

  beforeEach(() => {
    jasmine.clock().mockDate(mockDate)
  })

  afterAll(() => {
    jasmine.clock().uninstall()
  })

  describe('perf api available', () => {
    beforeEach(() => {
      const mockWindow = {
        performance: {
          now: () => 123.4, // offset since page was loaded at time origin, with fractional milliseconds
          timeOrigin: 1641027600000 // 2022-01-01T09:00:00.000Z in milliseconds
        }
      }
      mockWindowRefService = {
        get nativeWindow(): any {
          return mockWindow
        }
      }
    })

    it('should create an instance', () => {
      const sequenceNumber = 1
      expect(new MonotonicTime(mockWindowRefService, sequenceNumber)).toBeTruthy()
    })

    it('should store the current Date which has a getter', () => {
      const monotonicTime = new MonotonicTime(mockWindowRefService, 42)
      expect(monotonicTime.getLegacyDate().toISOString()).toEqual('2022-01-01T09:00:00.000Z')
    })

    it('should store the high-performance date and time', () => {
      const monotonicTime = new MonotonicTime(mockWindowRefService, 42)
      expect(monotonicTime.formatAsMilliseconds().toString()).toEqual(`${1641027600000 + 123.4}`) // can't compare floats
    })

    it('should store the sequence number',() => {
      const monotonicTime = new MonotonicTime(mockWindowRefService, 42)
      expect(monotonicTime.getSequenceNumber()).toEqual(42)
    })
  })



  describe('perf api is not available', () => {
    beforeEach(() => {
      const mockWindow = {}
      mockWindowRefService = {
        get nativeWindow(): any {
          return mockWindow
        }
      }
      const mockDate = new Date('2022-01-01T09:00:00Z')
      jasmine.clock().mockDate(mockDate)
    })

    it('should store the current Date which has a getter', () => {
      const monotonicTime = new MonotonicTime(mockWindowRefService, 42)
      expect(monotonicTime.getLegacyDate().toISOString()).toEqual('2022-01-01T09:00:00.000Z')
    })

    it('falls back to using the legacy date', () => {
      const monotonicTime = new MonotonicTime(mockWindowRefService, 42)
      expect(monotonicTime.formatAsMilliseconds()).toEqual(1641027600000)
    })
  })
})
