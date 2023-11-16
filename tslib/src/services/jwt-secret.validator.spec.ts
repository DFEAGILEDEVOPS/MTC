import { JwtSecretValidator } from './jwt-secret.validator'

describe('jwt-secret.validator', () => {
  test('throws when jwtSecret is undefined', () => {
    const jwtSecret = undefined
    expect(() => JwtSecretValidator.validate(jwtSecret)).toThrow('JWT secret cannot be null or undefined')
  })

  test('throws when jwtSecret is null', () => {
    const jwtSecret = null
    expect(() => JwtSecretValidator.validate(jwtSecret)).toThrow('JWT secret cannot be null or undefined')
  })

  test('throws if jwtSecret is less than 32 chars in length', () => {
    const jwtSecret = '1234567890123456789012345678901'
    expect(jwtSecret).toHaveLength(31)
    expect(() => JwtSecretValidator.validate(jwtSecret)).toThrow('JWT secret must be at least 32 characters in length')
  })
})
