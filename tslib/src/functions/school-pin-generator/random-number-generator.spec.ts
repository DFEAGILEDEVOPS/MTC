
import crypto from 'crypto'

let sut: RandomGenerator

describe('random-number-generator', () => {
  beforeEach(() => {
    sut = new RandomGenerator()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(RandomGenerator)
  })

  test('returns a random string', () => {
    const len = 10
    const chars = 'abcdefghijklmnop'
    const r1 = sut.generate(len, chars)
    expect(r1.length).toBe(len)
    expect(r1.match(/^[a-p]{10}$/)).toBeTruthy()
  })

  test('throws an error if chars are not given', () => {
    expect(
      function () { sut.generate(10, '') }
    ).toThrowError('Argument \'chars\' is undefined')
  })

  test('throws an error if chars are too long', () => {
    expect(
      function () { sut.generate(10, 'c'.repeat(257)) }
    ).toThrowError(`Argument 'chars' should not have more than 256 characters,
      otherwise unpredictability will be broken`)
  })
})

export interface IRandomGenerator {
  generate (length: number, chars: string): string
}

export class RandomGenerator implements IRandomGenerator {
  generate (length: number, chars: string): string {
    if (!chars) {
      throw new Error('Argument \'chars\' is undefined')
    }

    const charsLength = chars.length
    if (charsLength > 256) {
      throw new Error(`Argument 'chars' should not have more than 256 characters,
      otherwise unpredictability will be broken`)
    }

    const randomBytes = crypto.randomBytes(length)
    const result = []

    let cursor = 0
    for (let i = 0; i < length; i++) {
      cursor += randomBytes[i]
      result[i] = chars[cursor % charsLength]
    }

    return result.join('')
  }
}
