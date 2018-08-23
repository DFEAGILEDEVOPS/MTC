'use strict'
/* global describe it expect beforeEach spyOn */

const settingDataService = require('../../../services/data-access/setting.data.service')
const groupDataService = require('../../../services/data-access/group.data.service')
const configService = require('../../../services/config.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilMock = require('../mocks/pupil')

describe('config service', () => {
  describe('database config table values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50
      })
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
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
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
    })

    it('returns timings from the group table and overrides settings table values', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(40)
      expect(config.questionTime).toBe(60)
    })
  })

  describe('access arrangements', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(groupDataService, 'sqlFindOneGroupByPupilId')
    })

    it('it sets audible sounds to true if ATA is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(['ATA'])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(true)
    })

    it('it sets audible sounds to false if ATA is not flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(['---'])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
    })

    it('it sets audible sounds to false if pupil has no access arrangements', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds')
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).not.toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
    })
  })

  describe('database values do not exist', () => {
    it('returns timings from the config file', async () => {
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(groupDataService, 'sqlFindOneGroupByPupilId')
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(3)
      expect(config.questionTime).toBe(6)
    })
  })
})
