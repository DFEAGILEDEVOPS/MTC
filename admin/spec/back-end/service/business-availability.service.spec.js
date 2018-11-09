'use strict'
/* global describe it spyOn expect fail beforeEach */

const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const businessAvailabilityService = require('../../../services/business-availability.service')

describe('businessAvailabilityService', () => {
  describe('#determinePinGenerationEligibility', () => {
  })
  describe('#isPinGenerationAllowed', () => {
    beforeEach(() => {
      spyOn(checkWindowV2Service, 'getActiveCheckWindow')
      spyOn(schoolHomePinGenerationEligibilityPresenter, 'getPresentationData').and.returnValue({
        isLivePinGenerationAllowed: true,
        isFamiliarisationPinGenerationAllowed: false
      })
    })
    it('should return true if live pin generation is allowed', async () => {
      const isLiveCheck = true
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck)
      expect(result).toBeTruthy()
    })
    it('should return false if familiarisation pin generation is disallowed', async () => {
      const isLiveCheck = false
      const result = await businessAvailabilityService.isPinGenerationAllowed(isLiveCheck)
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
