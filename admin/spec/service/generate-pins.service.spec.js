'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const generatePinsService = require('../../services/generate-pins.service')

const pupilMock = require('../mocks/pupil')
const schoolMock = require('../mocks/school')

describe('generate-pins.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('getPupils', () => {
    let pupil1
    let pupil2
    beforeEach(() => {
      pupil1 = pupilMock
      pupil2 = pupilMock
      pupil2.id = '595cd5416e5ca13e48ed2520'
      pupil2.pin = 'f55sg'
      sandbox.mock(pupilDataService).expects('getPupils').resolves({ pupils: [pupil1, pupil2] })
      proxyquire('../../services/generate-pins.service', {
        '../../services/data-access/pupil.data.service': pupilDataService
      })
    })
    it('returns pupils with specific properties', async (done) => {
      const pupils = await generatePinsService.getPupils(schoolMock._id)
      expect(pupils.length).toBe(2)
      expect(Object.keys(pupils[0]).length).toBe(5)
      done()
    })
  })
})
