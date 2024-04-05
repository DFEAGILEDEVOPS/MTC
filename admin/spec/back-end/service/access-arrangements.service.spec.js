'use strict'
/* global describe, test, expect jest beforeEach afterEach */

const sut = require('../../../services/access-arrangements.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const accessArrangementsValidator = require('../../../lib/validator/access-arrangements-validator.js')
const ValidationError = require('../../../lib/validation-error')
const accessArrangementsErrorMessages = require('../../../lib/errors/access-arrangements')
const preparedCheckSyncService = require('../../../services/prepared-check-sync.service')
const moment = require('moment-timezone')
const checkWindowService = require('../../../services/check-window-v2.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')

describe('accessArrangementsService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAccessArrangements', () => {
    test('calls and returns access arrangements list', async () => {
      const accessArrangements = [
        {
          id: 1,
          displayOrder: 1,
          description: 'description',
          code: 'ABC'
        },
        {
          id: 2,
          displayOrder: 2,
          description: '2nd item',
          code: 'XYZ'
        }
      ]
      jest.spyOn(accessArrangementsDataService, 'sqlFindAccessArrangements').mockResolvedValue(accessArrangements)
      const result = await sut.getAccessArrangements()
      expect(accessArrangementsDataService.sqlFindAccessArrangements).toHaveBeenCalled()
      expect(result).toStrictEqual(accessArrangements)
    })
  })

  describe('submit', () => {
    beforeEach(() => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockResolvedValue()
    })

    test('calls preparedCheckSync service and returns access arrangements list', async () => {
      jest.spyOn(accessArrangementsValidator, 'validate').mockReturnValue((new ValidationError()))
      jest.spyOn(sut, 'prepareData').mockImplementation()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockResolvedValue({ id: 1 })
      jest.spyOn(sut, 'save').mockImplementation()
      jest.spyOn(preparedCheckSyncService, 'addMessages').mockImplementation()
      await sut.submit({}, 12345, 1)
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      expect(sut.prepareData).toHaveBeenCalled()
      expect(sut.save).toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).toHaveBeenCalled()
    })

    test('throws a validation error if validation is unsuccessful', async () => {
      const validationError = new ValidationError()
      validationError.addError('pupil-autocomplete-container', accessArrangementsErrorMessages.missingPupilName)
      validationError.addError('accessArrangementsList', accessArrangementsErrorMessages.missingAccessArrangements)
      jest.spyOn(accessArrangementsValidator, 'validate').mockReturnValue(validationError)
      jest.spyOn(sut, 'prepareData').mockImplementation()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockReturnValue({ id: 1 })
      jest.spyOn(sut, 'save').mockImplementation()
      jest.spyOn(preparedCheckSyncService, 'addMessages').mockImplementation()
      await expect(sut.submit({}, 12345, 1))
        .rejects
        .toBeInstanceOf(ValidationError)
      expect(accessArrangementsValidator.validate).toHaveBeenCalled()
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
      expect(sut.prepareData).not.toHaveBeenCalled()
      expect(sut.save).not.toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).not.toHaveBeenCalled()
    })

    test('throws an error if pupil is frozen', async () => {
      jest.spyOn(accessArrangementsValidator, 'validate').mockReturnValue((new ValidationError()))
      jest.spyOn(sut, 'prepareData').mockImplementation()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockResolvedValue({ id: 1 })
      jest.spyOn(sut, 'save').mockImplementation()
      jest.spyOn(preparedCheckSyncService, 'addMessages').mockImplementation()
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      await expect(sut.submit({}, 12345, 1)).rejects.toThrow('frozen')
    })
  })

  describe('prepareData', () => {
    test('returns a processed access arrangements submission object', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [accessArrangementsDataService.CODES.AUDIBLE_SOUNDS]
      }
      jest.spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').mockResolvedValue([{ id: 1, code: 'ATA' }])
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilColourContrastsId').mockImplementation()
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilFontSizesId').mockImplementation()
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(accessArrangementsDataService.sqlFindAccessArrangementsIdsWithCodes).toHaveBeenCalled()
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [{ id: 1, code: accessArrangementsDataService.CODES.AUDIBLE_SOUNDS }],
        recordedBy_user_id: 1
      }))
      expect(pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId).not.toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlFindPupilFontSizesId).not.toHaveBeenCalled()
    })
    test('throws an error if accessArrangement are not found based on codes provided', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: ['NONSENSE_CODE']
      }
      jest.spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').mockImplementation(() => {
        throw new Error('Code does not exist')
      })
      await expect(sut.prepareData(requestData, { id: 1 }, 12345, 1))
        .rejects
        .toThrow('Code does not exist')
    })
    test('throws an error if pupil record is not found', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [accessArrangementsDataService.CODES.AUDIBLE_SOUNDS]
      }
      jest.spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').mockResolvedValue([1])
      await expect(sut.prepareData(requestData, undefined, 12345, 1))
        .rejects
        .toThrow('Pupil object is not found')
    })
    test('expects pupilFontSizes_id property and pupilColourContrasts_id property to be set from existing ', async () => {
      const requestData = {
        pupilUrlSlug: 'pupilUrlSlug',
        accessArrangements: [
          accessArrangementsDataService.CODES.FONT_SIZE,
          accessArrangementsDataService.CODES.COLOUR_CONTRAST
        ]
      }
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilColourContrastsId').mockResolvedValue(2)
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilFontSizesId').mockResolvedValue(4)
      jest.spyOn(accessArrangementsDataService, 'sqlFindAccessArrangementsIdsWithCodes').mockResolvedValue([
        { id: 2, code: accessArrangementsDataService.CODES.COLOUR_CONTRAST },
        { id: 3, code: accessArrangementsDataService.CODES.FONT_SIZE }
      ])
      const result = await sut.prepareData(requestData, { id: 1 }, 12345, 1)
      expect(pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId).toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlFindPupilFontSizesId).toHaveBeenCalled()
      expect(result).toEqual(Object({
        pupil_id: 1,
        accessArrangementsIdsWithCodes: [
          { id: 2, code: accessArrangementsDataService.CODES.COLOUR_CONTRAST, colourContrastLookup_Id: 2 },
          { id: 3, code: accessArrangementsDataService.CODES.FONT_SIZE, fontSizeLookup_Id: 4 }
        ],
        recordedBy_user_id: 1
      })
      )
    })
  })

  describe('save', () => {
    test('calls sqlInsertAccessArrangements without isUpdated boolean if pupilAccessArrangement record does not exist', async () => {
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').mockImplementation()
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements').mockImplementation()
      const pupil = await sut.save({}, { id: '1', urlSlug: 'pupilUrlSlug' })
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({})
      expect(pupil.urlSlug).toBe('pupilUrlSlug')
    })
    test('calls sqlInsertAccessArrangements with isUpdated boolean if pupilAccessArrangement record exists', async () => {
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindPupilAccessArrangementsByPupilId').mockResolvedValue([{ pupil_id: 1 }])
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlInsertAccessArrangements').mockImplementation()
      await sut.save({}, { id: '1', urlSlug: 'pupilUrlSlug' })
      expect(pupilAccessArrangementsDataService.sqlInsertAccessArrangements).toHaveBeenCalledWith({}, true)
    })
  })

  describe('getCurrentViewMode', () => {
    let checkWindowData

    beforeEach(() => {
      checkWindowData = {
        adminStartDate: moment('2020-07-01T00:00:00'),
        adminEndDate: moment('2020-08-30T23:59:59'),
        checkStartDate: moment('2020-07-14T00:00:00'),
        checkEndDate: moment('2020-07-25T23:59:59'),
        familiarisationCheckStartDate: moment('2020-07-03T00:00:00'),
        familiarisationCheckEndDate: moment('2020-07-25T23:59:59')
      }
    })

    test('should return \'unavailable\' if current date before admin start date', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-06-30T23:59:59'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('unavailable')
    })

    // Edge case - the TIO period is expected to start when the admin period starts.  This test is to ensure the AA
    // are not active when they shouldn't be.
    test('should return \'readonly\' if current date after admin start date but before the try it out starts', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-07-01T05:59:59'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('readonly')
    })

    test('should return \'edit\' if Try it out is active and main check is inactive', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-07-02T09:00:00'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockReturnValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('readonly')
    })

    test('should return \'edit\' if current date within check period', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-07-14T06:00:00'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('edit')
    })

    test('should return \'readonly\' if current date past check end date but before admin end date', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-07-26T09:00:00'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('readonly')
    })

    test('should return \'unavailable\' if current date after admin end date', async () => {
      jest.spyOn(moment, 'tz').mockReturnValue(moment('2020-08-31T09:00:00'))
      jest.spyOn(checkWindowService, 'getActiveCheckWindow').mockResolvedValue(checkWindowData)
      expect(await sut.getCurrentViewMode()).toBe('unavailable')
    })
  })
})
