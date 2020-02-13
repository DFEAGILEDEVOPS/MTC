
let sut: AllowedWordsService

describe('allowed-words.service', () => {
  beforeEach(() => {
    sut = new AllowedWordsService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('allowed words must be a minimum set of 5', () => {
    try {
      sut.parse('foo,bar,baz,qix', '')
      fail('error should have thrown')
    } catch (error) {
      expect(error.message).toBe('set of allowed words must be a minimum of 5')
    }
  })

  test('allowed words must be sanitised for banned words before use', () => {
    const actual = sut.parse('foo,bar,baz,qix,pix,gem', 'gem')
    const expected = new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    expect(actual).toEqual(expected)
  })
})

export class AllowedWordsService {
  parse (wordset: string, bannedWords: string): Set<string> {
    const allowedWordsArray: Array<string> = wordset.split(',')
    const bannedWordsArray: Array<string> = bannedWords.split(',')
    const allowedWords = new Set<string>(allowedWordsArray)
    if (allowedWordsArray.length < 5) throw new Error('set of allowed words must be a minimum of 5')
    bannedWordsArray.forEach(word => {
      if (allowedWords.has(word)) {
        allowedWords.delete(word)
      }
    })
    return allowedWords
  }
}
