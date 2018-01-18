'use strict'
/* global describe it expect beforeEach spyOn */

const settingDataService = require('../../services/data-access/setting.data.service')
const configService = require('../../services/config.service')
const pupilMock = require('../mocks/pupil')

describe('config service', () => {
  describe('database values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50
      })
    })

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
    it('returns timings from the config file', async (done) => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue(null)
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(2)
      expect(config.questionTime).toBe(5)
      done()
    })
  })
})
