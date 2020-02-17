
import { RandomGenerator } from './random-generator'

let sut: RandomGenerator

describe('random-generator', () => {
  beforeEach(() => {
    sut = new RandomGenerator()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(RandomGenerator)
  })

  describe('generateFromChars', () => {
    test('returns a random string', () => {
      const len = 10
      const chars = 'abcdefghijklmnop'
      const r1 = sut.generateFromChars(len, chars)
      expect(r1.length).toBe(len)
      expect(r1.match(/^[a-p]{10}$/)).toBeTruthy()
    })

    test('throws an error if chars are not given', () => {
      expect(
        function () { sut.generateFromChars(10, '') }
      ).toThrowError('Argument \'chars\' is undefined')
    })

    test('throws an error if chars are too long', () => {
      expect(
        function () { sut.generateFromChars(10, 'c'.repeat(257)) }
      ).toThrowError(`Argument 'chars' should not have more than 256 characters, otherwise unpredictability will be broken`)
    })
  })

  describe('generateNumberFromRange', () => {
    test('should generate a random number in specific range', () => {
      const actual = sut.generateNumberFromRangeInclusive(1, 6)
      expect(typeof actual).toBe('number')
      expect(actual >= 0 || actual <= 6).toBeTruthy()
    })
  })

})
