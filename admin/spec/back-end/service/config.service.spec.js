'use strict'
/* global describe it expect beforeEach spyOn */

const settingDataService = require('../../../services/data-access/setting.data.service')
const configService = require('../../../services/config.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilMock = require('../mocks/pupil')

describe('config service', () => {
  describe('database config table values exist', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50,
        checkTimeLimit: 90
      })
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
    })

    it('returns timings from the config table when group values are missing', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(20)
      expect(config.questionTime).toBe(50)
      expect(config.checkTime).toBe(90)
    })

    it('adds the pupil checkOptions into the returned config', async () => {
      const config = await configService.getConfig(pupilMock)
      expect(config.speechSynthesis).toBeDefined()
    })
  })

  describe('access arrangements', () => {
    beforeEach(() => {
      spyOn(settingDataService, 'sqlFindOne').and.returnValue({
        loadingTimeLimit: 20,
        questionTimeLimit: 50,
        checkTimeLimit: 90
      })
    })
    it('it sets audible sounds to true if ATA is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.AUDIBLE_SOUNDS
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(true)
    })

    it('it sets numpad removal to true if RON is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.NUMPAD_REMOVAL
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.numpadRemoval).toBe(true)
    })

    it('it sets font size to true if FNT is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.FONT_SIZE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.fontSize).toBe(true)
    })

    it('it sets colour contrast to true if CCT is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.COLOUR_CONTRAST
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.colourContrast).toBe(true)
    })
    it('it sets input assistance to true if ITA is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.INPUT_ASSISTANCE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.inputAssistance).toBe(true)
    })

    it('it sets question reader to true if QNR is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.QUESTION_READER
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.questionReader).toBe(true)
    })

    it('it sets next between questions to true if NBQ is flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.NEXT_BETWEEN_QUESTIONS
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.nextBetweenQuestions).toBe(true)
    })

    it('it sets all access arrangements to false if not flagged for the pupil', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue(['---'])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1 }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
      expect(config.numpadRemoval).toBe(false)
    })

    it('it sets all access arrangements flags to false if pupil has no access arrangements', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds')
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).not.toHaveBeenCalled()
      expect(config.audibleSounds).toBe(false)
      expect(config.numpadRemoval).toBe(false)
    })
    it('it sets pupil font size selection in the config based on the received value from the database', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.FONT_SIZE
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1, pupilFontSizeCode: 'LRG' }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.fontSizeCode).toBe('LRG')
    })
    it('it sets colour contrast selection in the config based on the received value from the database', async () => {
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([
        accessArrangementsDataService.CODES.COLOUR_CONTRAST
      ])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue([
        { accessArrangements_id: 1, pupilColourContrastCode: 'BOW' }
      ])
      const config = await configService.getConfig(pupilMock)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds).toHaveBeenCalled()
      expect(config.colourContrastCode).toBe('BOW')
    })
  })

  describe('database values do not exist', () => {
    it('returns timings from the config file', async () => {
      spyOn(settingDataService, 'sqlFindOne')
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsCodesWithIds').and.returnValue([])
      spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').and.returnValue({})
      const config = await configService.getConfig(pupilMock)
      expect(config.loadingTime).toBe(3)
      expect(config.questionTime).toBe(6)
      expect(config.checkTime).toBe(30)
    })
  })
})
