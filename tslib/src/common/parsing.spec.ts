import * as parser from './parsing'

describe('primitiveToBoolean', () => {
  test('should be true if its 1 / "1" or "true"', () => {
    expect(parser.primitiveToBoolean(1)).toBe(true)
    expect(parser.primitiveToBoolean('1')).toBe(true)
    expect(parser.primitiveToBoolean('true')).toBe(true)
  })
  test('should be false if its 0 / "0" or "false"', () => {
    expect(parser.primitiveToBoolean(0)).toBe(false)
    expect(parser.primitiveToBoolean('0')).toBe(false)
    expect(parser.primitiveToBoolean('false')).toBe(false)
  })
  test('should be false if its null or undefined', () => {
    expect(parser.primitiveToBoolean(null)).toBe(false)
    expect(parser.primitiveToBoolean(undefined)).toBe(false)
  })
  test('shoultoBool.d pass through booleans - useful for undefined checks', () => {
    expect(parser.primitiveToBoolean(true)).toBe(true)
    expect(parser.primitiveToBoolean(false)).toBe(false)
  })
})

describe('propertyExists', () => {
  const obj: Record<string, unknown> = {
    age: 15,
    name: 'leonard'
  }
  test('should be true if property exists', () => {
    const result = parser.propertyExists(obj, 'name')
    expect(result).toBe(true)
  })
  test('should be false if property does not exist', () => {
    const result = parser.propertyExists(obj, 'lastName')
    expect(result).toBe(false)
  })
  test('should be false if property not provided', () => {
    const result = parser.propertyExists(obj, '')
    expect(result).toBe(false)
  })
})

describe('valueOrSubstitue', () => {
  test('should return number as string if valid number', () => {
    expect(parser.valueOrSubstitute(42, 23)).toBe('42')
  })
  test('should return replacement if value undefined', () => {
    expect(parser.valueOrSubstitute(undefined, 23)).toBe('23')
  })
  test('should return replacement if value null', () => {
    expect(parser.valueOrSubstitute(null, 23)).toBe('23')
  })
  test('should return replacement if value empty string', () => {
    expect(parser.valueOrSubstitute('', 23)).toBe('23')
  })
})
