'use strict'

/* global describe, it, expect */

const randomGenerator = require('../../lib/random-generator')

describe('random-generator', function () {
  it('returns a random string', function () {
    const len = 10
    const chars = 'abcdefghijklmnop'
    const r1 = randomGenerator.getRandom(len, chars)
    expect(r1.length).toBe(len)
    expect(r1.match(/^[a-p]{10}$/)).toBeTruthy()
  })

  it('throws an error if chars are not given', function () {
    expect(
      function () { randomGenerator.getRandom(10, '') }
    ).toThrow(`Argument 'chars' is undefined`)
    expect(
      function () { randomGenerator.getRandom(10, null) }
    ).toThrow(`Argument 'chars' is undefined`)
  })

  it('throws an error if chars are too long', function () {
    expect(
      function () { randomGenerator.getRandom(10, 'c'.repeat(257)) }
    ).toThrow(`Argument 'chars' should not have more than 256 characters, 
      otherwise unpredictability will be broken`)
  })
})
