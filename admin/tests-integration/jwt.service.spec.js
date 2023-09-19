/* global describe test expect beforeEach */

const { JwtService } = require('../services/jwt/jwt.service')
const config = require('../config')

describe('jwt service', () => {
  let sut
  beforeEach(() => {
    // create a 32 character string for a valid secret
    const secret = '12345678901234567890123456789012'
    config.PupilAuth.JwtSecret = secret
    sut = JwtService.getInstance()
  })

  test('it preserves the payload', async () => {
    const payload = { test: 'test' }
    const token = await sut.sign(payload)
    const decoded = await sut.verify(token)
    expect(decoded.test).toBe('test')
  })
})
