/* global describe, beforeEach, expect, it spyOn */

const moment = require('moment')

const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const config = require('../../../config')

describe('schoolHomePinGenerationEligibilityPresenter', () => {
  describe('getEligibilityData', () => {
    describe('when override is disabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = false
      })
      it('allows both familiarisation and live pin generation if within admin period but not within relevant check periods ', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(1, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().add(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(3, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeFalsy()
      })
      it('disallows both familiarisation and live pin generation if check window is in the past', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
          checkStartDate: moment.utc().subtract(4, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeFalsy()
      })
      it('disallow familiarisation pin generation and allows live pin generation if within familiarisation period', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().subtract(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(6, 'days'),
          checkStartDate: moment.utc().add(2, 'days'),
          checkEndDate: moment.utc().add(6, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeTruthy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeFalsy()
      })
      it('disallow familiarisation pin generation and live pin generation if within live period', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().subtract(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(6, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(6, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeTruthy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeFalsy()
      })
      it('disallows any pin generation if not within relevant hours', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(1, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().add(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(3, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const unavailableTime = moment.utc().set({
          hour: 18,
          minute: 0
        })
        spyOn(moment, 'utc').and.returnValue(unavailableTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isUnavailableTime).toBeTruthy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeFalsy()
      })
      it('disallows any pin generation if current date is before admin start date', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().add(1, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().add(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(3, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isPinGenerationInTheFuture).toBeTruthy()
      })
    })
    describe('when override is enabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = true
      })
      it('allows both familiarisation and live pin generation if regardless of check window period', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
          checkStartDate: moment.utc().subtract(4, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        })
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getEligibilityData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePeriodActive).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationPeriodActive).toBeFalsy()
      })
    })
  })
})
