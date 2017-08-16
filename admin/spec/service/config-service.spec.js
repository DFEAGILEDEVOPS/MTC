'use strict'
/* global describe it expect beforeEach afterEach */
const proxyquire = require('proxyquire')
const sinon = require('sinon')
require('sinon-mongoose')

const Settings = require('../../models/setting')

let sandbox
let configService
const configMock = {
  QUESTION_TIME_LIMIT: 500,
  TIME_BETWEEN_QUESTIONS: 200
}

describe('config service', () => {
  describe('database values exist', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.mock(Settings)
        .expects('findOne')
        .chain('exec')
        .resolves({
          loadingTimeLimit: 20,
          questionTimeLimit: 50
        })
      configService = proxyquire('../../services/config-service', {'../models/setting': Settings})
    })

    afterEach(() => { sandbox.restore() })

    it('returns timings from the database', async (done) => {
      const config = await configService.getConfig()
      expect(config.loadingTime).toBe(20)
      expect(config.questionTime).toBe(50)
      done()
    })
  })

  describe('database values do not exist', () => {
    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      sandbox.mock(Settings)
        .expects('findOne')
        .chain('exec')
        .resolves(null)
      configService = proxyquire('../../services/config-service', {'../models/setting': Settings, '../config': configMock})
    })

    afterEach(() => { sandbox.restore() })

    it('returns timings from the config file', async (done) => {
      const config = await configService.getConfig()
      expect(config.loadingTime).toBe(200)
      expect(config.questionTime).toBe(500)
      done()
    })
  })
})
