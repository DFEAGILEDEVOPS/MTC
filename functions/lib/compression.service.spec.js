'use strict'
/* global describe, it, expect */

const R = require('ramda')
const compressionService = require('./compression.service')

describe('compressionService', () => {
  describe('#compress', () => {
    it('has a compress function', () => {
      expect(typeof (compressionService.compress)).toBe('function')
    })
  })

  describe('#decompress', () => {
    it('has a decompress function', () => {
      expect(typeof (compressionService.decompress)).toBe('function')
    })
  })

  it('the results of compress/decompress are the same as the input', () => {
    const completedCheckMock = require('../completed-checks/mocks/completed-check-with-results.js')
    const stringInput = JSON.stringify(completedCheckMock)
    const compressed = compressionService.compress(stringInput)
    const stringOutput = compressionService.decompress(compressed)
    const outputObject = JSON.parse(stringOutput)
    const compressedSizePercent = Math.round((compressed.length / stringInput.length) * 100)
    expect(R.equals(stringInput, stringOutput)).toBeTruthy()
    expect(stringInput.length > compressed.length)
    // This get compressed to 18%
    expect(compressedSizePercent < 20).toBeTruthy()
    expect(outputObject.checkCode).toEqual(completedCheckMock.checkCode)
  })
})
