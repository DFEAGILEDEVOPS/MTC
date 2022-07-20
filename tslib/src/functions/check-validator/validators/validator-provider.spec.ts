import { ValidatorProvider } from './validator.provider'

let sut: ValidatorProvider

describe('validator-provider', () => {
  beforeEach(() => {
    sut = new ValidatorProvider()
  })

  test('returns all sync validators', () => {
    const validators = sut.getValidators()
    expect(validators).toBeDefined()
    expect(validators instanceof Array).toBe(true)
    expect(validators).toHaveLength(12)
  })

  test('returns all async validators', () => {
    const validators = sut.getAsyncValidators()
    expect(validators).toBeDefined()
    expect(validators instanceof Array).toBe(true)
    expect(validators).toHaveLength(1)
  })
})
