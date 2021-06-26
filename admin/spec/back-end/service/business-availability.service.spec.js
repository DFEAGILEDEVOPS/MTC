'use strict'
/* global describe it spyOn expect fail beforeEach */

const config = require('../../../config')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')
const headTeacherDeclarationService = require('../../../services/headteacher-declaration.service')

describe('businessAvailabilityService', () => {
  describe('#determinePinGenerationEligibility', () => {
  })

  describe('#isPinGenerationAllowed', () => {
    beforeEach(() => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isLivePinGenerationAllowed: true,
        isFamiliarisationPinGenerationAllowed: false
      })
    })
    it('should return true if live pin generation is allowed', async () => {
      const isLiveCheck = true
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeTruthy()
    })
    it('should return false if familiarisation pin generation is disallowed', async () => {
      const isLiveCheck = false
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeFalsy()
    })
  })

  describe('#areRestartsAllowed', () => {
    it('should return true if restarts are allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isRestartsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeTruthy()
    })
    it('should return false if restarts are not allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isRestartsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeFalsy()
    })
  })

  describe('#areGroupsAllowed', () => {
    it('should return true if groups are allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isGroupsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areGroupsAllowed(checkWindow)
      expect(result).toBeTruthy()
    })
    it('should return false if groups are not allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isGroupsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areGroupsAllowed(checkWindow)
      expect(result).toBeFalsy()
    })
  })

  describe('#areAccessArrangementsAllowed', () => {
    it('should return true if access arrangements are allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isAccessArrangementsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areAccessArrangementsAllowed(checkWindow)
      expect(result).toBeTruthy()
    })
    it('should return false if access arrangements are not allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isAccessArrangementsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areAccessArrangementsAllowed(checkWindow)
      expect(result).toBeFalsy()
    })
  })

  describe('#determinePinGenerationEligibility', () => {
    let isLiveCheck
    beforeEach(() => {
      isLiveCheck = true
    })
    it('should not throw an error if eligibility is true', async () => {
      const checkWindow = { id: 1 }
      spyOn(businessAvailabilityService, 'isPinGenerationAllowed').and.returnValue(true)
      try {
        await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      const checkWindow = { id: 1 }
      spyOn(businessAvailabilityService, 'isPinGenerationAllowed').and.returnValue(false)
      try {
        await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
        fail()
      } catch (error) {
        expect(error.message).toBe('Live pin generation is not allowed')
      }
    })
  })

  describe('#determineRestartsEligibility', () => {
    it('should not throw an error if eligibility is true', async () => {
      spyOn(businessAvailabilityService, 'areRestartsAllowed').and.returnValue(true)
      try {
        await businessAvailabilityService.determineRestartsEligibility({})
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(businessAvailabilityService, 'areRestartsAllowed').and.returnValue(false)
      try {
        await businessAvailabilityService.determineRestartsEligibility({})
        fail()
      } catch (error) {
        expect(error.message).toBe('Restarts are not allowed')
      }
    })
  })

  describe('#determineGroupsEligibility', () => {
    it('should not throw an error if eligibility is true', async () => {
      spyOn(businessAvailabilityService, 'areGroupsAllowed').and.returnValue(true)
      try {
        await businessAvailabilityService.determineGroupsEligibility({})
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(businessAvailabilityService, 'areGroupsAllowed').and.returnValue(false)
      try {
        await businessAvailabilityService.determineGroupsEligibility({})
        fail()
      } catch (error) {
        expect(error.message).toBe('Groups are not allowed')
      }
    })
  })

  describe('#determineAccessArrangementsEligibility', () => {
    it('should not throw an error if eligibility is true', async () => {
      spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').and.returnValue(true)
      try {
        await businessAvailabilityService.determineAccessArrangementsEligibility({})
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').and.returnValue(false)
      try {
        await businessAvailabilityService.determineAccessArrangementsEligibility({})
        fail()
      } catch (error) {
        expect(error.message).toBe('Access Arrangements are not allowed')
      }
    })
  })

  describe('#getAvailabilityData', () => {
    const schoolId = 1

    it('inAdminEndPeriod is true when we are in the end admin period', async () => {
      const mockCheckWindow = require('../mocks/check-window').postLiveCheckWindow
      spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').and.returnValue(false)
      spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').and.returnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(true)
    })

    it('inAdminEndPeriod is false when we are in the check period', async () => {
      const mockCheckWindow = require('../mocks/check-window').liveCheckWindow
      spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').and.returnValue(false)
      spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').and.returnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(false)
    })

    it('inAdminEndPeriod is false when we are in the familiarisation period', async () => {
      const mockCheckWindow = require('../mocks/check-window').familiarisationCheckWindow
      spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').and.returnValue(false)
      spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').and.returnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(false)
    })
  })
})
