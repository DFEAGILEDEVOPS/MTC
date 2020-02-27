'use strict'

/* global describe test expect fail */

const sut = require('./school-pin.service')

describe('school-pin-service', () => {
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should throw an error if urlSlug parameter is not defined', async () => {
    try {
      await sut.generateSchoolPin()
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('urlSlug is required')
    }
  })
})
