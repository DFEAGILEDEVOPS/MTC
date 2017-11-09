'use strict'
/* global describe, beforeEach, afterEach, it, expect */
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const moment = require('moment')
const schoolDataService = require('../../services/data-access/school.data.service')
const schoolService = require('../../services/school.service')
const schoolMock = require('../mocks/school')

describe('school.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())
  describe('getActiveSchool', () => {
    beforeEach(() => {
      let school = Object.assign({}, schoolMock)
      school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
      sandbox.mock(schoolDataService).expects('findOne').resolves(school)
      proxyquire('../../services/generate-pins.service', {
        '../../services/data-access/school.data.service': schoolDataService
      })
      describe('if pin is valid', () => {
        beforeEach(() => {
          sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
        })
        it('it should return school object', () => {
          const result = schoolService.getActiveSchool(school.id)
          expect(result.pinExpiresAt).toBeDefined()
          expect(result.schoolPin).toBeDefined()
        })
      })
      describe('if pin is invalid', () => {
        beforeEach(() => {
          sandbox.useFakeTimers(moment().startOf('day').add(100, 'years').valueOf())
        })
        it('it should return null', () => {
          const result = schoolService.getActiveSchool(school.id)
          expect(result).toBeUndefined()
        })
      })
    })
  })
})
