import crypto from 'crypto'
export interface IRandomGenerator {
  generateFromChars (length: number, chars: string): string
  generateNumberFromRangeInclusive (minimum: number, maximum: number): number
}
export class RandomGenerator implements IRandomGenerator {

  generateNumberFromRangeInclusive (minimum: number, maximum: number): number {
    const maxDec = 281474976710656
    const randBytes = parseInt(crypto.randomBytes(6).toString('hex'), 16)
    return Math.floor(randBytes / maxDec * (maximum - minimum + 1) + minimum)
  }

  generateFromChars (length: number, chars: string): string {
    if (!chars) {
      throw new Error('Argument \'chars\' is undefined')
    }
    const charsLength = chars.length
    if (charsLength > 256) {
      throw new Error(`Argument 'chars' should not have more than 256 characters, otherwise unpredictability will be broken`)
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
