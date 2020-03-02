
export class MaxAttemptsCalculator {
  calculate (wordCount: number, charCount: number) {
    return (wordCount * wordCount) * (charCount * charCount)
  }
}

let sut: MaxAttemptsCalculator

describe('max-attemps-calculator', () => {
  beforeEach(() => {
    sut = new MaxAttemptsCalculator()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(MaxAttemptsCalculator)
  })

  test('returns zero if word count is zero', () => {
    const maxAttempts = sut.calculate(0, 5)
    expect(maxAttempts).toBe(0)
  })

  test('returns zero if number char count is zero', () => {
    const maxAttempts = sut.calculate(5, 0)
    expect(maxAttempts).toBe(0)
  })

  test('calculates max attempts based upon combination of two word sets and two sets of chars', () => {
    const wordSetCount = 50
    const charCount = 5
    const expectedMaxAttempts = (wordSetCount * wordSetCount) * (charCount * charCount)
    const actual = sut.calculate(wordSetCount, charCount)
    expect(actual).toEqual(expectedMaxAttempts)
  })
})
