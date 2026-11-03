const { v4: uuidv4, validate, version } = require('uuid')

describe('UUID Jest compatibility', () => {
  test('generates a v4 UUID using Web Crypto randomUUID', () => {
    const uuid = uuidv4()

    expect(validate(uuid)).toBe(true)
    expect(version(uuid)).toBe(4)
  })

  test('generates a v4 UUID using Web Crypto getRandomValues', () => {
    const uuid = uuidv4({})

    expect(validate(uuid)).toBe(true)
    expect(version(uuid)).toBe(4)
  })
})
