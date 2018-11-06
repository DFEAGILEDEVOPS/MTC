'use strict'
/* global describe it spyOn expect fail beforeEach */

const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
const pinGenerationEligibilityService = require('../../../services/pin-generation-eligibility.service')

describe('pinGenerationEligibilityService', () => {
  describe('#determinePinGenerationEligibility', () => {
  })
  describe('#isPinGenerationAllowed', () => {
    beforeEach(() => {
      spyOn(schoolHomePinGenerationEligibilityPresenter, 'getPresentationData').and.returnValue({
        isLivePinGenerationAllowed: true,
        isFamiliarisationPinGenerationAllowed: false
      })
    })
    it('should return true if live pin generation is allowed', async () => {
      const isLiveCheck = true
      const result = await pinGenerationEligibilityService.isPinGenerationAllowed(isLiveCheck)
      expect(result).toBeTruthy()
    })
    it('should return false if familiarisation pin generation is disallowed', async () => {
      const isLiveCheck = false
      const result = await pinGenerationEligibilityService.isPinGenerationAllowed(isLiveCheck)
      expect(result).toBeFalsy()
    })
    it('should throw an error if not a boolean parameter is provided', async () => {
      try {
        const isLiveCheck = ''
        await pinGenerationEligibilityService.isPinGenerationAllowed(isLiveCheck)
        fail()
      } catch (error) {
        expect(error.message).toBe('type of check not detected')
      }
    })
  })
  describe('#determinePinGenerationEligibility', () => {
    let isLiveCheck
    beforeEach(() => {
      isLiveCheck = true
    })
    it('should not throw an error if eligibility is true', async () => {
      spyOn(pinGenerationEligibilityService, 'isPinGenerationAllowed').and.returnValue(true)
      try {
        await pinGenerationEligibilityService.determinePinGenerationEligibility(isLiveCheck)
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(pinGenerationEligibilityService, 'isPinGenerationAllowed').and.returnValue(false)
      try {
        await pinGenerationEligibilityService.determinePinGenerationEligibility(isLiveCheck)
        fail()
      } catch (error) {
        expect(error.message).toBe('Live pin generation is not allowed')
      }
    })
  })
})
