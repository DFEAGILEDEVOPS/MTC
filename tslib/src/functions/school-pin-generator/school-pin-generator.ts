import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { AllowedWordsService } from './allowed-words.service'
import { IRandomGenerator, RandomGenerator } from './random-number-generator.spec'

export class SchoolPinGenerator implements ISchoolPinGenerator {

  private configProvider: IConfigProvider
  private randomGenerator: IRandomGenerator
  private allowedWordsService: AllowedWordsService
  private chars = '23456789'

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
    const wordSet = this.allowedWordsService.parse(
      this.configProvider.AllowedWords,
      this.configProvider.BannedWords)
    const wordArray = Array.from(wordSet)
    const twoDigitNum = this.randomGenerator.generate(2, this.chars)
    return `${wordArray[0]}${twoDigitNum}${wordArray[1]}`
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
