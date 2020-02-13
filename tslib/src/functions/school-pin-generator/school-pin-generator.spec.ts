import { SchoolPinGenerator } from './school-pin-generator'
import { IConfigProvider } from './config-file-provider'

let sut: SchoolPinGenerator
let configProviderMock: IConfigProvider

const ConfigProviderMock = jest.fn<IConfigProvider, any>(() => ({
  OverridePinExpiry: jest.fn(),
  AllowedWords: jest.fn(() => 'foo,bar,baz,qix,bix')
}))

describe('school-pin-generator', () => {

  beforeEach(() => {
    configProviderMock = new ConfigProviderMock()
    sut = new SchoolPinGenerator(configProviderMock)
  })

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test.todo('first 3 chars of pin must be word from allowed words set')
  test.todo('chars 4 and 5 must be 2 digit number constructed from 23456789')
  test.todo('last 3 chars of pin must be word from allowed words set')

})


