import { type IPinConfigProvider, PinConfigProvider } from './pin-config-provider'
import { type IRandomGenerator, RandomGenerator } from './random-generator'

export class SchoolPinGenerator implements ISchoolPinGenerator {
  private readonly configProvider: IPinConfigProvider
  private readonly randomGenerator: IRandomGenerator

  constructor (configProvider?: IPinConfigProvider, randomGenerator?: IRandomGenerator) {
    if (configProvider === undefined) {
      configProvider = new PinConfigProvider()
    }
    this.configProvider = configProvider
    if (randomGenerator === undefined) {
      randomGenerator = new RandomGenerator()
    }
    this.randomGenerator = randomGenerator
  }

  generate (allowedWordSet: Set<string>): string {
    const wordArray = Array.from(allowedWordSet)
    const twoDigitNum = this.randomGenerator.generateFromChars(2, this.configProvider.DigitChars)
    const firstRandomIndex = this.randomGenerator.generateNumberFromRangeInclusive(0, wordArray.length - 1)
    const firstRandomWord = wordArray[firstRandomIndex]
    const secondRandomIndex = this.randomGenerator.generateNumberFromRangeInclusive(0, wordArray.length - 1)
    const secondRandomWord = wordArray[secondRandomIndex]
    return `${firstRandomWord}${twoDigitNum}${secondRandomWord}`
  }
}

export interface ISchoolPinGenerator {
  generate (allowedWordSet: Set<string>): string
}
