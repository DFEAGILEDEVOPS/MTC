'use strict'
/* global describe, it, expect */

const pinGenerationService = require('../services/pin-generation.service')

describe('generateCryptoRandomNumber', () => {
  it('should approximately generate numbers with similar probability chance', () => {
    const numbersArr = []
    const length = 1000
    const min = 1
    const max = 5

    for (let index = 0; index < length; index++) {
      numbersArr.push(pinGenerationService.generateCryptoRandomNumber(min, max))
    }

    const count = {}
    for (let num of numbersArr) {
      count[ num ] = count[ num ] ? count[ num ] + 1 : 1
    }

    const expectedResult = numbersArr.length / ((max - min) + 1)
    const errorPercentTolerance = 0.21 // 21%
    const tolerance = expectedResult * errorPercentTolerance

    for (let [ number, freq ] of Object.entries(count)) {
      expect(number >= min && number <= max).toBeTruthy()
      expect(freq).toBeGreaterThanOrEqual(expectedResult - tolerance)
      expect(freq).toBeLessThanOrEqual(expectedResult + tolerance)
    }
  })
})
