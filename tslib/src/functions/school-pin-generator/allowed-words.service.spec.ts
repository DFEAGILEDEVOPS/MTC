import { AllowedWordsService } from './allowed-words.service'

let sut: AllowedWordsService

describe('allowed-words.service', () => {
  beforeEach(() => {
    sut = new AllowedWordsService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(AllowedWordsService)
  })

  test('allowed words must be a minimum set of 5', () => {
    try {
      sut.parse('foo,bar,baz,qix', '')
      fail('error should have thrown')
    } catch (error) {
      let errorMessage = 'unknown error'
      if (error instanceof Error) {
        errorMessage = error.message
      }
      expect(errorMessage).toBe('set of allowed words must be a minimum of 5')
    }
  })

  test('allowed words must be sanitised for banned words before use', () => {
    const actual = sut.parse('foo,bar,baz,qix,pix,gem', 'gem')
    const expected = new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    expect(actual).toStrictEqual(expected)
  })
})
