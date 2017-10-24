'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const pupilService = require('../../services/pupil.service')
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
        sandbox.mock(pupilService).expects('fetchSortedPupilsData').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilService
        })
      })
      it('with specific properties', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(2)
        expect(Object.keys(pupils[ 0 ]).length).toBe(6)
        done()
      })
    })
    describe('filter and returns sorted pupils', () => {
      beforeEach(() => {
        const pupil1 = Object.assign({}, pupilMock)
        pupil1.pin = ''
        const pupil2 = Object.assign({}, pupilMock)
        pupil2._id = '595cd5416e5ca13e48ed2520'
        pupil2.pin = 'f55sg'
        sandbox.mock(pupilService).expects('fetchSortedPupilsData').resolves([ pupil1, pupil2 ])
        proxyquire('../../services/generate-pins.service', {
          '../../services/pupil.service': pupilService
        })
      })
      it('without pre existing pins', async (done) => {
        const pupils = await generatePinsService.getPupils(schoolMock._id, 'lastName', 'asc')
        expect(pupils.length).toBe(1)
        done()
      })
    })
  })
})
