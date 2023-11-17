'use strict'
/* global describe, expect beforeEach fail jest test afterEach */

const preparedCheckSyncService = require('../../../services/prepared-check-sync.service')
const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')
const { PupilFrozenService } = require('../../../services/pupil-frozen/pupil-frozen.service')
const uuid = require('uuid')
const moment = require('moment')

const pupilAccessArrangementsMock = [
  {
    urlSlug: '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    foreName: 'Ebony',
    middleNames: '',
    lastName: 'Daniels',
    description: 'Audible time alert',
    dateOfBirth: moment('2012-07-01T00:00:00Z')
  },
  {
    urlSlug: '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    foreName: 'Ebony',
    middleNames: '',
    lastName: 'Daniels',
    description: 'Colour contrast',
    dateOfBirth: moment('2012-07-02T00:00:00Z')
  },
  {
    urlSlug: '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    foreName: 'Ebony',
    middleNames: '',
    lastName: 'Daniels',
    description: 'Remove on-screen number pad',
    dateOfBirth: moment('2012-07-03T00:00:00Z')
  },
  {
    urlSlug: '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    foreName: 'Gregory',
    middleNames: 'Green',
    lastName: 'Duke',
    description: 'Colour contrast',
    dateOfBirth: moment('2012-07-04T00:00:00Z')
  },
  {
    urlSlug: '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    foreName: 'Gregory',
    middleNames: 'Green',
    lastName: 'Duke',
    description: 'Font size',
    dateOfBirth: moment('2012-07-04T00:00:00Z')
  },
  {
    urlSlug: '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    foreName: 'Sweeney',
    middleNames: 'White',
    lastName: 'Wolfe',
    description: 'Question reader (reason required)',
    dateOfBirth: moment('2012-07-06T00:00:00Z')
  },
  {
    urlSlug: '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    foreName: 'Sweeney',
    middleNames: 'White',
    lastName: 'Wolfe',
    description: 'Remove on-screen number pad',
    dateOfBirth: moment('2012-07-07T00:00:00Z')
  }
]

describe('pupilAccessArrangementsService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getPupils', () => {
    describe('successfully processes and', () => {
      let pupils
      beforeEach(async () => {
        jest.spyOn(pupilAccessArrangementsDataService, 'sqFindPupilsWithAccessArrangements').mockResolvedValue(pupilAccessArrangementsMock)
        pupils = await pupilAccessArrangementsService.getPupils(9991001)
      })

      test('returns a list of pupils with associated access arrangements', () => {
        expect(pupils.length).toBe(3)
        expect(pupils[1]).toEqual(expect.objectContaining(
          {
            urlSlug: '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
            foreName: 'Gregory',
            middleNames: 'Green',
            lastName: 'Duke',
            arrangements: ['Colour contrast', 'Font size'],
            fullName: 'Duke, Gregory'
          }
        ))
      })

      test('removes reason required phrase if exists on access arrangements description list', () => {
        expect(pupils[2].arrangements[0]).toBe('Question reader')
      })

      test('should not include description property', () => {
        expect(pupils[2].description).toBeUndefined()
      })
    })
  })

  describe('getPupilEditFormData', () => {
    test('returns pupil access arrangement data without question reader reason', async () => {
      const accessArrangementsData = [
        {
          urlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: '',
          nextButtonInformation: '',
          questionReaderOtherInformation: '',
          accessArrangementCode: 'CCT',
          questionReaderReasonCode: null
        },
        {
          urlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: 'inputAssistanceInformation',
          nextButtonInformation: 'nextButtonInformation',
          questionReaderOtherInformation: '',
          accessArrangementCode: 'ITA',
          questionReaderReasonCode: null
        }
      ]
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindAccessArrangementsByUrlSlug').mockResolvedValue(accessArrangementsData)
      const formData = await pupilAccessArrangementsService.getPupilEditFormData('urlSlug')
      expect(formData).toEqual(
        {
          pupilUrlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: 'inputAssistanceInformation',
          nextButtonInformation: 'nextButtonInformation',
          questionReaderOtherInformation: '',
          accessArrangements: ['CCT', 'ITA'],
          questionReaderReason: null,
          isEditView: true
        }
      )
    })

    test('returns pupil access arrangement data with question reader reason', async () => {
      const accessArrangementsData = [
        {
          urlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: '',
          nextButtonInformation: '',
          questionReaderOtherInformation: '',
          accessArrangementCode: 'CCT',
          questionReaderReasonCode: null
        },
        {
          urlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: '',
          nextButtonInformation: '',
          questionReaderOtherInformation: 'questionReaderOtherInformation',
          accessArrangementCode: 'QNR',
          questionReaderReasonCode: 'OTH'
        }
      ]
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindAccessArrangementsByUrlSlug').mockResolvedValue(accessArrangementsData)
      const formData = await pupilAccessArrangementsService.getPupilEditFormData('urlSlug')
      expect(formData).toEqual(
        {
          pupilUrlSlug: 'urlSlug',
          foreName: 'foreName',
          lastName: 'lastName',
          inputAssistanceInformation: '',
          nextButtonInformation: '',
          questionReaderOtherInformation: 'questionReaderOtherInformation',
          accessArrangements: ['CCT', 'QNR'],
          questionReaderReason: 'OTH',
          isEditView: true
        }
      )
    })
  })

  describe('deletePupilAccessArrangements', () => {
    test('returns pupil data when successfully deleting relevant access arrangements', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockResolvedValue()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockReturnValue({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlDeletePupilsAccessArrangements').mockImplementation()
      jest.spyOn(preparedCheckSyncService, 'addMessages').mockImplementation()
      const urlSlug = uuid.v4()
      const pupilData = await pupilAccessArrangementsService.deletePupilAccessArrangements(urlSlug, 9991001)
      expect(pupilData).toEqual({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements).toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).toHaveBeenCalled()
    })

    test('rejects if url slug is not present', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockResolvedValue()
      jest.spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').mockImplementation()
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlDeletePupilsAccessArrangements').mockImplementation()
      jest.spyOn(preparedCheckSyncService, 'addMessages').mockImplementation()
      try {
        await pupilAccessArrangementsService.deletePupilAccessArrangements()
        fail('deletePupilAccessArrangements method did not throw an error')
      } catch (error) {
        expect(error.message).toBe('Pupil url slug is not provided')
      }
      expect(pupilDataService.sqlFindOneBySlugAndSchool).not.toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements).not.toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).not.toHaveBeenCalled()
    })

    test('throws an error if pupil is frozen', async () => {
      jest.spyOn(PupilFrozenService, 'throwIfFrozenByUrlSlugs').mockImplementation(() => {
        throw new Error('frozen')
      })
      const urlSlug = uuid.v4()
      await expect(pupilAccessArrangementsService.deletePupilAccessArrangements(urlSlug, 9991001)).rejects.toThrow('frozen')
    })
  })

  describe('#getEligiblePupilsWithFullNames', () => {
    test('it returns an object with combined name values and urlSlug', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindEligiblePupilsBySchoolId').mockReturnValue(pupilMocks)
      let pupils
      try {
        pupils = await pupilAccessArrangementsService.getEligiblePupilsWithFullNames(1234567)
      } catch (error) {
        fail()
      }
      expect(pupils[0].fullName).toBe('Johnson, John Test')
      expect(pupils[1].fullName).toBe('Johnson2, John2')
      expect(pupils[0].urlSlug).toBe('AA-12345')
      expect(pupils.length).toBe(2)
    })

    test('it throws an error when dfeNumber is not provided', async () => {
      jest.spyOn(pupilAccessArrangementsDataService, 'sqlFindEligiblePupilsBySchoolId').mockImplementation()
      try {
        await pupilAccessArrangementsService.getEligiblePupilsWithFullNames()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is not provided')
      }
      expect(pupilAccessArrangementsDataService.sqlFindEligiblePupilsBySchoolId).not.toHaveBeenCalled()
    })
  })
})
