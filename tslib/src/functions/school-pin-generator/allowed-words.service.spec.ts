import { AllowedWordsService } from './allowed-words.service'
import { type IPinConfigProvider } from './pin-config-provider'
import { type ISchoolPinDataService } from './school-pin-data-service'

let sut: AllowedWordsService
const schoolPinDataServiceMock: ISchoolPinDataService = {
  getAllowedWords: jest.fn()
}
const pinConfigProviderMock: IPinConfigProvider = {
  BannedWords: 'gem',
  OverridePinExpiry: false,
  PinUpdateMaxAttempts: 5,
  DigitChars: '23456'
}

describe('allowed-words.service', () => {
  beforeEach(() => {
    sut = new AllowedWordsService(pinConfigProviderMock, schoolPinDataServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(AllowedWordsService)
  })

  test('allowed words must be a minimum set of 5', async () => {
    try {
      jest.spyOn(schoolPinDataServiceMock, 'getAllowedWords').mockResolvedValue(['foo', 'bar', 'baz', 'qix'])
      await sut.getAllowedWords()
      fail('error should have thrown')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe('set of allowed words must be a minimum of 5')
    }
  })

  test('allowed words must be sanitised for banned words before use', async () => {
    jest.spyOn(schoolPinDataServiceMock, 'getAllowedWords').mockResolvedValue(['foo', 'bar', 'baz', 'qix', 'pix', 'gem'])
    const actual = await sut.getAllowedWords()
    const expected = new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    expect(actual).toStrictEqual(expected)
  })
})
