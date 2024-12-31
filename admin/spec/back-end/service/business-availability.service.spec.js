'use strict'

const config = require('../../../config')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')
const headTeacherDeclarationService = require('../../../services/headteacher-declaration.service')

describe('businessAvailabilityService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#isPinGenerationAllowed', () => {
    beforeEach(() => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isLivePinGenerationAllowed: true,
        isFamiliarisationPinGenerationAllowed: false
      })
    })
    test('should return true if live pin generation is allowed', async () => {
      const isLiveCheck = true
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeTruthy()
    })
    test('should return false if familiarisation pin generation is disallowed', async () => {
      const isLiveCheck = false
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeFalsy()
    })
  })

  describe('#areRestartsAllowed', () => {
    test('should return true if restarts are allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isRestartsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeTruthy()
    })
    test('should return false if restarts are not allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isRestartsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow, config.DEFAULT_TIMEZONE)
      expect(result).toBeFalsy()
    })
  })

  describe('#areGroupsAllowed', () => {
    test('should return true if groups are allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isGroupsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areGroupsAllowed(checkWindow)
      expect(result).toBeTruthy()
    })
    test('should return false if groups are not allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isGroupsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areGroupsAllowed(checkWindow)
      expect(result).toBeFalsy()
    })
  })

  describe('#areAccessArrangementsAllowed', () => {
    test('should return true if access arrangements are allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
        isAccessArrangementsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areAccessArrangementsAllowed(checkWindow)
      expect(result).toBeTruthy()
    })
    test('should return false if access arrangements are not allowed', async () => {
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockReturnValue({
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
    test('should throw an error if eligibility is false', () => {
      const checkWindow = { id: 1 }
      jest.spyOn(businessAvailabilityService, 'isPinGenerationAllowed').mockReturnValue(false)
      expect(
        () => { businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck, checkWindow, config.DEFAULT_TIMEZONE) }
      ).toThrowError('Live pin generation is not allowed')
    })
  })

  describe('#determineRestartsEligibility', () => {
    test('should not throw an error if eligibility is true', () => {
      jest.spyOn(businessAvailabilityService, 'areRestartsAllowed').mockReturnValue(true)
      expect(() => { businessAvailabilityService.determineRestartsEligibility({}) }).not.toThrow()
    })
    test('should throw an error if eligibility is false', () => {
      jest.spyOn(businessAvailabilityService, 'areRestartsAllowed').mockReturnValue(false)
      expect(() => { businessAvailabilityService.determineRestartsEligibility({}) }).toThrow('Restarts are not allowed')
    })
  })

  describe('#determineGroupsEligibility', () => {
    test('should not throw an error if eligibility is true', () => {
      jest.spyOn(businessAvailabilityService, 'areGroupsAllowed').mockReturnValue(true)
      expect(() => { businessAvailabilityService.determineGroupsEligibility({}) }).not.toThrow()
    })
    test('should throw an error if eligibility is false', async () => {
      jest.spyOn(businessAvailabilityService, 'areGroupsAllowed').mockReturnValue(false)
      expect(() => { businessAvailabilityService.determineGroupsEligibility({}) }).toThrowError('Groups are not allowed')
    })
  })

  describe('#determineAccessArrangementsEligibility', () => {
    test('should not throw an error if eligibility is true', () => {
      jest.spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').mockReturnValue(true)
      expect(() => { businessAvailabilityService.determineAccessArrangementsEligibility({}) }).not.toThrow()
    })
    test('should throw an error if eligibility is false', () => {
      jest.spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').mockReturnValue(false)
      expect(() => { businessAvailabilityService.determineAccessArrangementsEligibility({}) }).toThrowError('Access Arrangements are not allowed')
    })
  })

  describe('#getAvailabilityData', () => {
    const schoolId = 1

    test('inAdminEndPeriod is true when we are in the end admin period', async () => {
      const mockCheckWindow = require('../mocks/check-window').postLiveCheckWindow
      jest.spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').mockResolvedValue(false)
      jest.spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').mockReturnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(true)
    })

    test('inAdminEndPeriod is false when we are in the check period', async () => {
      const mockCheckWindow = require('../mocks/check-window').liveCheckWindow
      jest.spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').mockResolvedValue(false)
      jest.spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').mockReturnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(false)
    })

    test('inAdminEndPeriod is false when we are in the familiarisation period', async () => {
      const mockCheckWindow = require('../mocks/check-window').familiarisationCheckWindow
      jest.spyOn(headTeacherDeclarationService, 'isHdfSubmittedForCheck').mockResolvedValue(false)
      jest.spyOn(businessAvailabilityService, 'areAccessArrangementsAllowed').mockReturnValue(true)
      const data = await businessAvailabilityService.getAvailabilityData(schoolId, mockCheckWindow)
      expect(data.inAdminEndPeriod).toBe(false)
    })
  })
})
