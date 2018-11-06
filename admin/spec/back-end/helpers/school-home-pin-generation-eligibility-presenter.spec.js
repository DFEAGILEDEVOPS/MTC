/* global describe, beforeEach, expect, it spyOn */

const moment = require('moment')

const schoolHomePinGenerationEligibilityPresenter = require('../../../helpers/school-home-pin-generation-eligibility-presenter')
const checkWindowV2Service = require('../../../services/check-window-v2.service')
const config = require('../../../config')

describe('schoolHomePinGenerationEligibilityPresenter', () => {
  describe('getPresentationData', () => {
    describe('when override is disabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = false
      })
      it('allows both familiarisation and live pin generation if within admin period and within check periods ', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
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
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      it('disallows both familiarisation and live pin generation if check window is in the future', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().add(2, 'days'),
          adminEndDate: moment.utc().add(15, 'days'),
          familiarisationCheckStartDate: moment.utc().add(4, 'days'),
          familiarisationCheckEndDate: moment.utc().add(12, 'days'),
          checkStartDate: moment.utc().add(5, 'days'),
          checkEndDate: moment.utc().add(12, 'days')
        })
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeTruthy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallow live pin generation and allows familiarisation pin generation if within only familiarisation period', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(6, 'days'),
          checkStartDate: moment.utc().add(1, 'days'),
          checkEndDate: moment.utc().add(6, 'days')
        })
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallows any familiarisation pin generation when date is within that period and outside of available times', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const disallowedDateTime = moment.utc().set({ hour: 18 })
        spyOn(moment, 'utc').and.returnValue(disallowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallows any live pin generation when date is within that period and outside of available times', async () => {
        spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue({
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        })
        const disallowedDateTime = moment.utc().set({ hour: 18 })
        spyOn(moment, 'utc').and.returnValue(disallowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
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
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = await schoolHomePinGenerationEligibilityPresenter.getPresentationData()
        expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
    })
  })
})
