import { type IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { AllowedWordsService } from './allowed-words.service'
import { type IRandomGenerator, RandomGenerator } from './random-generator'

export class SchoolPinGenerator implements ISchoolPinGenerator {
  private readonly configProvider: IConfigProvider
  private readonly randomGenerator: IRandomGenerator
  private readonly allowedWordsService: AllowedWordsService

  constructor (configProvider?: IConfigProvider, randomGenerator?: IRandomGenerator) {
    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider
    if (randomGenerator === undefined) {
      randomGenerator = new RandomGenerator()
    }
    this.randomGenerator = randomGenerator
    this.allowedWordsService = new AllowedWordsService()
  }

  generate (): string {
    const wordSet = this.allowedWordsService.parse(this.configProvider.AllowedWords, this.configProvider.BannedWords)
    const wordArray = Array.from(wordSet)
    const twoDigitNum = this.randomGenerator.generateFromChars(2, this.configProvider.DigitChars)
    const firstRandomIndex = this.randomGenerator.generateNumberFromRangeInclusive(0, wordArray.length - 1)
    const firstRandomWord = wordArray[firstRandomIndex]
    const secondRandomIndex = this.randomGenerator.generateNumberFromRangeInclusive(0, wordArray.length - 1)
    const secondRandomWord = wordArray[secondRandomIndex]
    return `${firstRandomWord}${twoDigitNum}${secondRandomWord}`
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
