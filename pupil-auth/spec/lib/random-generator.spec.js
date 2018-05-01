'use strict'

/* global describe, it, expect */

const randomGenerator = require('../../lib/random-generator')

describe('random-generator', () => {
  it('returns a random string', () => {
    const len = 10
    const chars = 'abcdefghijklmnop'
    const r1 = randomGenerator.getRandom(len, chars)
    expect(r1.length).toBe(len)
    expect(r1.match(/^[a-p]{10}$/)).toBeTruthy()
  })

  it('throws an error if chars are not given', () => {
    expect(
      function () { randomGenerator.getRandom(10, '') }
    ).toThrowError(`Argument 'chars' is undefined`)
    expect(
      function () { randomGenerator.getRandom(10, null) }
    ).toThrowError(`Argument 'chars' is undefined`)
  })

  it('throws an error if chars are too long', () => {
    expect(
      function () { randomGenerator.getRandom(10, 'c'.repeat(257)) }
    ).toThrowError(`Argument 'chars' should not have more than 256 characters, 
      otherwise unpredictability will be broken`)
  })
})
