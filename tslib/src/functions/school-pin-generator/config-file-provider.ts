import config from '../../config'

export interface IConfigProvider {
  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
  PinUpdateMaxAttempts: number
}

export class ConfigFileProvider implements IConfigProvider {
  constructor () {
    this.AllowedWords = config.SchoolPinGenerator.AllowedWords
    this.OverridePinExpiry = config.SchoolPinGenerator.OverridePinExpiry
    this.BannedWords = config.SchoolPinGenerator.BannedWords
    this.PinUpdateMaxAttempts = config.SchoolPinGenerator.PinUpdateMaxAttempts
  }

  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
  PinUpdateMaxAttempts: number
}
