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

    describe('returns pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = ''
        sandbox.mock(pupilDataService).expects('getPupils').resolves({ pupils: [ pupil1, pupil2 ] })
        proxyquire('../../services/generate-pins.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id)
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[ 0 ]).length).toBe(5)
        done()
      })
    })
    describe('filter and returns pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        sandbox.mock(pupilDataService).expects('getPupils').resolves({ pupils: [ pupil1, pupil2 ] })
        proxyquire('../../services/generate-pins.service', {
          '../../services/data-access/pupil.data.service': pupilDataService
        })
      })
      it('without pre existing pins', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id)
        expect(pupils.length).toBe(1)
        done()
      })
    })
  })
})
