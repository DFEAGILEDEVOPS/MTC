import * as toBool from './to-bool'

describe('primitiveToBoolean', () => {
  test('should be true if its 1 / "1" or "true"', () => {
    expect(toBool.primitiveToBoolean(1)).toBe(true)
    expect(toBool.primitiveToBoolean('1')).toBe(true)
    expect(toBool.primitiveToBoolean('true')).toBe(true)
  })
  test('should be false if its 0 / "0" or "false"', () => {
    expect(toBool.primitiveToBoolean(0)).toBe(false)
    expect(toBool.primitiveToBoolean('0')).toBe(false)
    expect(toBool.primitiveToBoolean('false')).toBe(false)
  })
  test('should be false if its null or undefined', () => {
    expect(toBool.primitiveToBoolean(null)).toBe(false)
    expect(toBool.primitiveToBoolean(undefined)).toBe(false)
  })
  test('shoultoBool.d pass through booleans - useful for undefined checks', () => {
    expect(toBool.primitiveToBoolean(true)).toBe(true)
    expect(toBool.primitiveToBoolean(false)).toBe(false)
  })
})
