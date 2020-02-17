import { SchoolPinGenerator } from './school-pin-generator'
import { IConfigProvider } from './config-file-provider'
import { IRandomGenerator } from './random-generator'

let sut: SchoolPinGenerator
const configProviderMock: IConfigProvider = {
  AllowedWords: 'foo,bar,baz,qix,mix',
  BannedWords: '',
  OverridePinExpiry: false
}

let randomGeneratorMock: IRandomGenerator
const RandomGeneratorMock = jest.fn<IRandomGenerator, any>(() => ({
  generateFromChars: jest.fn(() => '42'),
  generateNumberFromRangeInclusive: jest.fn(() => 2)
}))

describe('school-pin-generator', () => {

  beforeEach(() => {
    randomGeneratorMock = new RandomGeneratorMock()
    sut = new SchoolPinGenerator(configProviderMock, randomGeneratorMock)
  })

  test('subject is defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinGenerator)
  })

  test('school pin must be 8 chars in length', () => {
    const actual = sut.generate()
    expect(actual.length).toBe(8)
  })

  test('school pin must be 3 char word + 2 digits + 3 char word', () => {
    const actual = sut.generate()
    expect(/^[a-z]{3}[2-9]{2}[a-z]{3}$/.test(actual)).toBe(true)
  })

  test('it sources 2 digit number and both random words from generator on each call', () => {
    sut.generate()
    sut.generate()
    expect(randomGeneratorMock.generateFromChars).toHaveBeenCalledTimes(2)
    expect(randomGeneratorMock.generateNumberFromRangeInclusive).toHaveBeenCalledTimes(4)
  })

})
