import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { AllowedWordsService } from './allowed-words.service'

/*
import config from '../../config'

 const allowedWords = new Set(
  (config.SchoolPinGenerator.AllowedWords && config.SchoolPinGenerator.AllowedWords.split(',')) || []
)

const bannedWords = [
  'dim'
]

const chars = '23456789' */

export class SchoolPinGenerator implements ISchoolPinGenerator {

  private configProvider: IConfigProvider
  private allowedWordsService: AllowedWordsService

  constructor (configProvider?: IConfigProvider) {
    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider
    this.allowedWordsService = new AllowedWordsService()
  }

  generate (): string {
    return this.allowedWordsService.parse(
      this.configProvider.AllowedWords,
      this.configProvider.BannedWords)
      .keys.toString()
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
