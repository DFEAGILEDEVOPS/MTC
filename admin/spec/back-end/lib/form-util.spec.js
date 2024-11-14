const { formUtil, formUtilTypes } = require('../../../lib/form-util')

describe('formUtil.convertFromString', () => {
  describe('convert to int', () => {
    test('it types as null when given an empty string', () => {
      const res = formUtil.convertFromString('', formUtilTypes.int)
      expect(res).toBeNull()
    })

    test('it types as null when given invalid input', () => {
      const res = formUtil.convertFromString('string', formUtilTypes.int)
      expect(res).toBeNull()
    })

    test('it returns an int', () => {
      const res = formUtil.convertFromString('42', formUtilTypes.int)
      expect(res).toBe(42)
    })

    test('it returns an int', () => {
      const res = formUtil.convertFromString('42.1', formUtilTypes.int)
      expect(res).toBe(42)
    })

    test('it returns an int', () => {
      const res = formUtil.convertFromString('42.9', formUtilTypes.int)
      expect(res).toBe(42)
    })

    test('it returns null when given undefined', () => {
      const res = formUtil.convertFromString(undefined, formUtilTypes.int)
      expect(res).toBeNull()
    })
  })

  describe('convert to float', () => {
    test('returns null when given an empty string', () => {
      const res = formUtil.convertFromString('', formUtilTypes.float)
      expect(res).toBeNull()
    })

    test('returns null when given invalid input', () => {
      const res = formUtil.convertFromString('', formUtilTypes.float)
      expect(res).toBeNull()
    })

    test('it returns a float', () => {
      const res = formUtil.convertFromString('42.0', formUtilTypes.float)
      expect(res).toBe(42.0)
    })

    test('it returns a float', () => {
      const res = formUtil.convertFromString('42.1', formUtilTypes.float)
      expect(res).toBe(42.1)
    })

    test('it returns a float', () => {
      const res = formUtil.convertFromString('42.901234', formUtilTypes.float)
      expect(res).toBe(42.901234)
    })

    test('it returns null when given undefined', () => {
      const res = formUtil.convertFromString(undefined, formUtilTypes.float)
      expect(res).toBeNull()
    })
  })

  test('it return the val if the typeCode is not recognised', () => {
    expect(formUtil.convertFromString('string', -1))
  })
})
