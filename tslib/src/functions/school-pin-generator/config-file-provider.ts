import config from '../../config'

export interface IConfigProvider {
  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
}

export class ConfigFileProvider implements IConfigProvider {
  constructor () {
    this.AllowedWords = config.SchoolPinGenerator.AllowedWords
    this.OverridePinExpiry = config.SchoolPinGenerator.OverridePinExpiry
    this.BannedWords = config.SchoolPinGenerator.BannedWords
  }

  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
}
