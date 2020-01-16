const moment = require('moment')
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const pinValidator = require('../../../lib/validator/pin-validator')
const schoolDataService = require('../../../services/data-access/school.data.service')

const schoolMock = require('../mocks/school')

/* global describe, it, expect, beforeEach, afterEach */

describe('pin.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.createSandbox()
  })

  afterEach(() => sandbox.restore())

  describe('getActiveSchool', () => {
    let service
    const school = Object.assign({}, schoolMock)
    school.pinExpiresAt = moment().startOf('day').add(16, 'hours')
    describe('if pin is valid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(true)
        service = proxyquire('../../../services/pin.service', {
          '../../../services/data-access/school.data.service': schoolDataService,
          '../../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return school object', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.schoolPin).toBeDefined()
      })
    })
    describe('if pin is invalid', () => {
      beforeEach(() => {
        sandbox.mock(schoolDataService).expects('sqlFindOneByDfeNumber').resolves(school)
        sandbox.mock(pinValidator).expects('isActivePin').returns(false)
        service = proxyquire('../../../services/pin.service', {
          '../../../services/data-access/school.data.service': schoolDataService,
          '../../../lib/validator/pin-validator': pinValidator
        })
      })
      it('it should return null', async () => {
        const result = await service.getActiveSchool(school.id)
        expect(result).toBeNull()
      })
    })
  })
})
