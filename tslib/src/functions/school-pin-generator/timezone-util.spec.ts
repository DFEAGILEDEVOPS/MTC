import { TimezoneUtil } from './timezone-util'

describe('utc-offset-resolver', () => {
  let sut: TimezoneUtil
  beforeEach(() => {
    sut = new TimezoneUtil()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should resolve utc offset correctly', () => {
    const tz = 'Asia/Tokyo'
    const expected = 9
    const actual = sut.resolveToHours(tz)
    expect(actual).toEqual(expected)
  })
})
