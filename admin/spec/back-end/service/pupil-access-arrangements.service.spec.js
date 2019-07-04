'use strict'
/* global describe, it, expect spyOn beforeEach fail */

const preparedCheckSyncService = require('../../../services/prepared-check-sync.service')
const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilAccessArrangementsDataService = require('../../../services/data-access/pupil-access-arrangements.data.service')

const pupilAccessArrangementsMock = [
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Audible time alert'
  },
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Colour contrast'
  },
  {
    'urlSlug': '93935288-CD8F-46D5-99D4-10A9F01F0F70',
    'foreName': 'Ebony',
    'middleNames': '',
    'lastName': 'Daniels',
    'description': 'Remove on-screen number pad'
  },
  {
    'urlSlug': '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    'foreName': 'Gregory',
    'middleNames': 'Green',
    'lastName': 'Duke',
    'description': 'Colour contrast'
  },
  {
    'urlSlug': '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
    'foreName': 'Gregory',
    'middleNames': 'Green',
    'lastName': 'Duke',
    'description': 'Font size'
  },
  {
    'urlSlug': '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    'foreName': 'Sweeney',
    'middleNames': 'White',
    'lastName': 'Wolfe',
    'description': 'Question reader (reason required)'
  },
  {
    'urlSlug': '34356B98-BCD8-485F-9F2E-F4CBF2741FA7',
    'foreName': 'Sweeney',
    'middleNames': 'White',
    'lastName': 'Wolfe',
    'description': 'Remove on-screen number pad'
  }
]

describe('pupilAccessArrangementsService', () => {
  describe('getPupils', () => {
    describe('successfully processes and', () => {
      let pupils
      beforeEach(async () => {
        spyOn(pupilAccessArrangementsDataService, 'sqFindPupilsWithAccessArrangements').and.returnValue(pupilAccessArrangementsMock)
        pupils = await pupilAccessArrangementsService.getPupils(9991001)
      })
      it('returns a list of pupils with associated access arrangements', () => {
        expect(pupils.length).toBe(3)
        expect(pupils[1]).toEqual(
          {
            urlSlug: '7E0FB2BC-B23F-448B-870A-A92731ADC7DC',
            foreName: 'Gregory',
            middleNames: 'Green',
            lastName: 'Duke',
            arrangements: ['Colour contrast', 'Font size'],
            fullName: 'Duke, Gregory'
          }
        )
      })
      it('removes reason required phrase if exists on access arrangements description list', () => {
        expect(pupils[2].arrangements[0]).toBe('Question reader')
      })
      it('should not include description property', () => {
        expect(pupils[2].description).toBeUndefined()
      })
    })
  })
  describe('getPupilEditFormData', () => {
    it('returns pupil access arrangement data without question reader reason', async () => {
      const accessArrangementsData = [
        {
          'urlSlug': 'urlSlug',
          'foreName': 'foreName',
          'lastName': 'lastName',
          'inputAssistanceInformation': '',
          'nextButtonInformation': '',
          'questionReaderOtherInformation': '',
          'accessArrangementCode': 'CCT',
          'questionReaderReasonCode': null
        },
        {
          'urlSlug': 'urlSlug',
          'foreName': 'foreName',
          'lastName': 'lastName',
          'inputAssistanceInformation': 'inputAssistanceInformation',
          'nextButtonInformation': 'nextButtonInformation',
          'questionReaderOtherInformation': '',
          'accessArrangementCode': 'ITA',
          'questionReaderReasonCode': null
        }
      ]
      spyOn(pupilAccessArrangementsDataService, 'sqlFindAccessArrangementsByUrlSlug').and.returnValue(accessArrangementsData)
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
    it('returns pupil access arrangement data with question reader reason', async () => {
      const accessArrangementsData = [
        {
          'urlSlug': 'urlSlug',
          'foreName': 'foreName',
          'lastName': 'lastName',
          'inputAssistanceInformation': '',
          'nextButtonInformation': '',
          'questionReaderOtherInformation': '',
          'accessArrangementCode': 'CCT',
          'questionReaderReasonCode': null
        },
        {
          'urlSlug': 'urlSlug',
          'foreName': 'foreName',
          'lastName': 'lastName',
          'inputAssistanceInformation': '',
          'nextButtonInformation': '',
          'questionReaderOtherInformation': 'questionReaderOtherInformation',
          'accessArrangementCode': 'QNR',
          'questionReaderReasonCode': 'OTH'
        }
      ]
      spyOn(pupilAccessArrangementsDataService, 'sqlFindAccessArrangementsByUrlSlug').and.returnValue(accessArrangementsData)
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
    it('returns pupil data when successfully deleting relevant access arrangements', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool').and.returnValue({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      spyOn(pupilAccessArrangementsDataService, 'sqlDeletePupilsAccessArrangements')
      spyOn(preparedCheckSyncService, 'addMessages')
      const pupilData = await pupilAccessArrangementsService.deletePupilAccessArrangements('urlSlug', 9991001)
      expect(pupilData).toEqual({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      expect(pupilDataService.sqlFindOneBySlugAndSchool).toHaveBeenCalled()
      expect(pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements).toHaveBeenCalled()
      expect(preparedCheckSyncService.addMessages).toHaveBeenCalled()
    })
    it('rejects if url slug is not present', async () => {
      spyOn(pupilDataService, 'sqlFindOneBySlugAndSchool')
      spyOn(pupilAccessArrangementsDataService, 'sqlDeletePupilsAccessArrangements')
      spyOn(preparedCheckSyncService, 'addMessages')
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
  })
  describe('#getEligiblePupilsWithFullNames', () => {
    it('it returns an object with combined name values and urlSlug', async () => {
      const pupilMocks = [
        { foreName: 'John', middleNames: 'Test', lastName: 'Johnson', urlSlug: 'AA-12345' },
        { foreName: 'John2', middleNames: '', lastName: 'Johnson2', urlSlug: 'BB-12345' }
      ]
      spyOn(pupilAccessArrangementsDataService, 'sqlFindEligiblePupilsBySchoolID').and.returnValue(pupilMocks)
      let pupils
      try {
        pupils = await pupilAccessArrangementsService.getEligiblePupilsWithFullNames(1234567)
      } catch (error) {
        fail()
      }
      expect(pupils[0].fullName).toBe('Johnson John Test')
      expect(pupils[1].fullName).toBe('Johnson2 John2')
      expect(pupils[0].urlSlug).toBe('AA-12345')
      expect(pupils.length).toBe(2)
    })
    it('it throws an error when dfeNumber is not provided', async () => {
      spyOn(pupilAccessArrangementsDataService, 'sqlFindEligiblePupilsBySchoolID')
      try {
        await pupilAccessArrangementsService.getEligiblePupilsWithFullNames()
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is not provided')
      }
      expect(pupilAccessArrangementsDataService.sqlFindEligiblePupilsBySchoolID).not.toHaveBeenCalled()
    })
  })
})
