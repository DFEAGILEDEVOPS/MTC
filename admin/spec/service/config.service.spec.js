'use strict'
/* global describe it expect beforeEach spyOn */

const settingDataService = require('../../services/data-access/setting.data.service')
const groupDataService = require('../../services/data-access/group.data.service')
const configService = require('../../services/config.service')
const pupilMock = require('../mocks/pupil')

describe('config service', () => {
  describe('database config table values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50
      })
      spyOn(groupDataService, 'sqlFindOneGroupByPupilId')
    })

    it('returns timings from the config table when group values are missing', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(20)
      expect(config.questionTime).toBe(50)
    })

    it('adds the pupil checkOptions into the returned config', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.speechSynthesis).toBeDefined()
    })
  })

  describe('database group table values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50
      })
      spyOn(groupDataService, 'sqlFindOneGroupByPupilId').and.returnValue({
        loadingTimeLimit: 40,
        questionTimeLimit: 60
      })
    })

    it('returns timings from the group table and overrides settings table values', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(40)
      expect(config.questionTime).toBe(60)
    })
  })

  describe('database values do not exist', () => {
    it('returns timings from the config file', async () => {
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(groupDataService, 'sqlFindOneGroupByPupilId')
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(3)
      expect(config.questionTime).toBe(6)
    })
  })
})
