'use strict'

/* global describe test expect fail spyOn */

const sut = require('./school-pin.service')
const dataService = require('./data-access/school-pin.data.service')
const uuid = require('uuid/v4')

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

  test('error thrown if 8 digit pin not returned', async () => {
    spyOn(dataService, 'callFunctionApi').and.returnValue(undefined)
    const schoolUrlSlug = uuid()
    try {
      await sut.generateSchoolPin(schoolUrlSlug)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe(`unable to generate pin for school.urlSlug:${schoolUrlSlug}`)
    }
  })
})
