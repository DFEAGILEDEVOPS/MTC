import config from '../../config'

export interface IPinConfigProvider {
  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
  PinUpdateMaxAttempts: number
  DigitChars: string
}

export class PinConfigProvider implements IPinConfigProvider {
  constructor () {
    this.AllowedWords = config.SchoolPinGenerator.AllowedWords
    this.OverridePinExpiry = config.SchoolPinGenerator.OverridePinExpiry
    this.BannedWords = config.SchoolPinGenerator.BannedWords
    this.PinUpdateMaxAttempts = config.SchoolPinGenerator.PinUpdateMaxAttempts
    this.DigitChars = config.SchoolPinGenerator.DigitChars
  }

  OverridePinExpiry: boolean
  AllowedWords: string
  BannedWords: string
  PinUpdateMaxAttempts: number
  DigitChars: string
}
