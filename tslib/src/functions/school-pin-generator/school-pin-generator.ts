
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
  generate (): string {
    return 'abc12def'
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
