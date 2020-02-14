import { SchoolPinGenerator } from './school-pin-generator'
import { IConfigProvider } from './config-file-provider'

let sut: SchoolPinGenerator
const configProviderMock: IConfigProvider = {
  AllowedWords: '',
  BannedWords: '',
  OverridePinExpiry: false
}

describe('school-pin-generator', () => {

  beforeEach(() => {
    sut = new SchoolPinGenerator(configProviderMock)
  })

  test('subject is defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinGenerator)
  })

  test.todo('first 3 chars of pin must be word from allowed words set')
  test.todo('chars 4 and 5 must be 2 digit number constructed from 23456789')
  test.todo('last 3 chars of pin must be word from allowed words set')

})
