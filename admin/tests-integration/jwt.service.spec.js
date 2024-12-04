const { JwtService } = require('../services/jwt/jwt.service')
const config = require('../config')

describe('jwt service', () => {
  let sut
  beforeEach(() => {
    // create a 32 character string for a valid secret
    const secret = '12345678901234567890123456789012'
    config.PupilApi.Submission.JwtSecret = secret
    sut = JwtService.getInstance()
  })

  test('it preserves the payload', async () => {
    const payload = {
      test: 'test',
      other: {
        foo: 'bar',
        xyz: {
          abc: '123'
        }
      }
    }
    const token = await sut.sign(payload)
    const decoded = await sut.verify(token)
    expect(decoded.test).toBe('test')
  })

  test('all payload properties are correctly set', async () => {
    const payload = {
      foo: 'bar'
    }
    const subject = '1234567890'
    const options = {
      issuer: 'MTC Admin',
      subject,
      expiresIn: '5d'
    }
    const token = await sut.sign(payload, options)
    const decoded = await sut.verify(token)
    expect(decoded.exp).toEqual(expect.any(Number))
    expect(decoded.foo).toBe('bar')
    expect(decoded.iss).toBe('MTC Admin')
    expect(decoded.sub).toBe(subject)
    expect(decoded.iat).toEqual(expect.any(Number))
  })

  test('expired token fails verification', async () => {
    const payload = { test: 'test' }
    const options = {
      expiresIn: '1ms'
    }
    const token = await sut.sign(payload, options)
    await new Promise(resolve => setTimeout(resolve, 2))
    await expect(sut.verify(token)).rejects.toThrow('jwt expired')
  })

  test('modified token fails verification', async () => {
    const payload = { test: 'test' }
    const token = await sut.sign(payload)
    const modifiedToken = `${token}sdkfjsd`
    await expect(sut.verify(modifiedToken)).rejects.toThrow('invalid signature')
  })

  test('same payload with different secret fails verification', async () => {
    const payload = { test: 'test' }
    const token = await sut.sign(payload)
    config.PupilApi.Submission.JwtSecret = 'different-secret'
    await expect(sut.verify(token)).rejects.toThrow('invalid signature')
  })

  test('empty payload verification still outputs issued at timestamp', async () => {
    const payload = {}
    const token = await sut.sign(payload)
    const decoded = await sut.verify(token)
    expect(decoded).toBeDefined()
    expect(decoded.iat).toBeDefined()
  })
})
