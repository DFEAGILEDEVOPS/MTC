'use strict'
/* global describe it spyOn expect fail beforeEach */

const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')

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
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow)
      expect(result).toBeTruthy()
    })
    it('should return false if familiarisation pin generation is disallowed', async () => {
      const isLiveCheck = false
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck, checkWindow)
      expect(result).toBeFalsy()
    })
  })
  describe('#areRestartsAllowed', () => {
    it('should return true if restarts are allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isRestartsPageAccessible: true
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow)
      expect(result).toBeTruthy()
    })
    it('should return false if restarts are not allowed', async () => {
      spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').and.returnValue({
        isRestartsPageAccessible: false
      })
      const checkWindow = { id: 1 }
      const result = await businessAvailabilityService.areRestartsAllowed(checkWindow)
      expect(result).toBeFalsy()
    })
  })
  describe('#determinePinGenerationEligibility', () => {
    let isLiveCheck
    beforeEach(() => {
      isLiveCheck = true
    })
    it('should not throw an error if eligibility is true', async () => {
      spyOn(businessAvailabilityService, 'isPinGenerationAllowed').and.returnValue(true)
      try {
        await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck)
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(businessAvailabilityService, 'isPinGenerationAllowed').and.returnValue(false)
      try {
        await businessAvailabilityService.determinePinGenerationEligibility(isLiveCheck)
        fail()
      } catch (error) {
        expect(error.message).toBe('Live pin generation is not allowed')
      }
    })
  })
})
