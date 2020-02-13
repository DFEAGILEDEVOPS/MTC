import { IConfigProvider, ConfigFileProvider } from './config-file-provider'

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
  private allowedWords: Set<string>

  constructor (configProvider?: IConfigProvider) {
    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider
    const words = this.configProvider.AllowedWords()
    this.allowedWords = new Set(
      (words && words.split(',')) || []
    )
  }


  generate (): string {
    return this.allowedWords.keys.toString()
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
