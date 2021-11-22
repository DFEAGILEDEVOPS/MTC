import { ValidatorProvider } from './validator.provider'

let sut: ValidatorProvider

describe('validator-provider', () => {
  beforeEach(() => {
    sut = new ValidatorProvider()
  })

  test('returns all validators', () => {
    const validators = sut.getValidators()
    expect(validators).toBeDefined()
    expect(validators instanceof Array).toBe(true)
    expect(validators).toHaveLength(12)
  })
})
