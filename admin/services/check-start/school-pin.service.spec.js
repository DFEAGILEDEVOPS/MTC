'use strict'

const sut = require('./school-pin.service')

describe('school-pin-service', () => {
  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should throw an error if urlSlug parameter is not defined', async () => {
    try {
      await sut.generateSchoolPin(undefined)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('schoolId is required')
    }
  })
})
