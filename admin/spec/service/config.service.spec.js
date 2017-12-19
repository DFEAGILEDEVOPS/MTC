'use strict'
/* global describe it expect beforeEach afterEach */
const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const settingsDataService = require('../../services/data-access/setting.data.service')

let sandbox
let configService
const configMock = {
  QUESTION_TIME_LIMIT: 500,
  TIME_BETWEEN_QUESTIONS: 200
}
const pupilMock = require('../mocks/pupil')

describe('config service', () => {
  describe('database values exist', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.mock(settingsDataService)
        .expects('sqlFindOne')
        .resolves({
          loadingTimeLimit: 20,
          questionTimeLimit: 50
        })
      configService = proxyquire('../../services/config.service', {
        './data-access/setting.data.service': settingsDataService
      })
    })

    afterEach(() => { sandbox.restore() })

    it('returns timings from the database', async (done) => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(20)
      expect(config.questionTime).toBe(50)
      done()
    })

    it('adds the pupil checkOptions into the returned config', async (done) => {
      const config = await configService.getConfig(pupilMock)
      expect(config.speechSynthesis).toBeDefined()
      done()
    })
  })

  describe('database values do not exist', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.mock(settingsDataService)
        .expects('sqlFindOne')
        .resolves(null)
      configService = proxyquire('../../services/config.service', {
        './data-access/setting.data.service': settingsDataService,
        '../config': configMock
      })
    })

    afterEach(() => { sandbox.restore() })

    it('returns timings from the config file', async (done) => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(200)
      expect(config.questionTime).toBe(500)
      done()
    })
  })
})
