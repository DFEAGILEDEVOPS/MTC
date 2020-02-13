import config from '../../config'

export interface IConfigProvider {
  OverridePinExpiry (): boolean
  AllowedWords (): string
}

export class ConfigFileProvider implements IConfigProvider {
  OverridePinExpiry (): boolean {
    return config.SchoolPinGenerator.OverridePinExpiry
  }
  AllowedWords (): string {
    return config.SchoolPinGenerator.AllowedWords
  }
}
