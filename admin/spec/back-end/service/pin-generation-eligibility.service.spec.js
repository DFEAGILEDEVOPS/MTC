'use strict'
/* global describe it spyOn expect fail beforeEach */

const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
const pinGenerationEligibilityService = require('../../../services/pin-generation-eligibility.service')

describe('pinGenerationEligibilityService', () => {
  describe('#determinePinGenerationEligibility', () => {
  })
  describe('#isPinGenerationAllowed', () => {
    beforeEach(() => {
      spyOn(schoolHomePinGenerationEligibilityPresenter, 'getEligibilityData').and.returnValue({
        isLivePinGenerationAllowed: true,
        isFamiliarisationPinGenerationAllowed: false
      })
    })
    it('should return true if live pin generation is allowed', async () => {
      const result = await pinGenerationEligibilityService.isPinGenerationAllowed(true)
      expect(result).toBeTruthy()
    })
    it('should return false if familiarisation pin generation is disallowed', async () => {
      const result = await pinGenerationEligibilityService.isPinGenerationAllowed(false)
      expect(result).toBeFalsy()
    })
    it('should throw an error if pin environment is not provided', async () => {
      try {
        await pinGenerationEligibilityService.isPinGenerationAllowed('')
        fail()
      } catch (error) {
        expect(error.message).toBe('type of check not detected')
      }
    })
  })
  describe('#determinePinGenerationEligibility', () => {
    it('should not throw an error if eligibility is true', async () => {
      spyOn(pinGenerationEligibilityService, 'isPinGenerationAllowed').and.returnValue(true)
      try {
        await pinGenerationEligibilityService.determinePinGenerationEligibility(true)
      } catch (error) {
        fail()
      }
    })
    it('should throw an error if eligibility is false', async () => {
      spyOn(pinGenerationEligibilityService, 'isPinGenerationAllowed').and.returnValue(false)
      try {
        await pinGenerationEligibilityService.determinePinGenerationEligibility(true)
        fail()
      } catch (error) {
        expect(error.message).toBe('Live pin generation is not allowed')
      }
    })
  })
})
