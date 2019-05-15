/* global describe, beforeEach, expect, it spyOn */

const moment = require('moment-timezone')

const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const config = require('../../../config')

describe('schoolHomeFeatureEligibilityPresenter', () => {
  describe('getPresentationData', () => {
    describe('when override is disabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = false
      })
      it('allows both familiarisation and live pin generation if within admin period and within check periods ', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      it('disallows both familiarisation and live pin generation if check window is in the past', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
          checkStartDate: moment.utc().subtract(4, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      it('disallows both familiarisation and live pin generation if check window is in the future', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().add(2, 'days'),
          adminEndDate: moment.utc().add(15, 'days'),
          familiarisationCheckStartDate: moment.utc().add(4, 'days'),
          familiarisationCheckEndDate: moment.utc().add(12, 'days'),
          checkStartDate: moment.utc().add(5, 'days'),
          checkEndDate: moment.utc().add(12, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeTruthy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallow live pin generation and allows familiarisation pin generation if within only familiarisation period', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(6, 'days'),
          checkStartDate: moment.utc().add(1, 'days'),
          checkEndDate: moment.utc().add(6, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallows any familiarisation pin generation when date is within that period and outside of available times', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const disallowedDateTime = moment.utc().set({ hour: 18 })
        spyOn(moment, 'tz').and.returnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      it('disallows any live pin generation when date is within that period and outside of available times', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const disallowedDateTime = moment.utc().set({ hour: 18 })
        spyOn(moment, 'tz').and.returnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      it('disallows restarts and groups when outside of a live check window', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const disallowedDateTime = moment.utc().set({ hour: 18 })
        spyOn(moment, 'tz').and.returnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      it('disallows restarts when outside of a live check window', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().add(2, 'days'),
          adminEndDate: moment.utc().add(15, 'days'),
          familiarisationCheckStartDate: moment.utc().add(4, 'days'),
          familiarisationCheckEndDate: moment.utc().add(12, 'days'),
          checkStartDate: moment.utc().add(5, 'days'),
          checkEndDate: moment.utc().add(12, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isRestartsPageAccessible).toBeFalsy()
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      it('allows restarts when inside of a live check window', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isRestartsPageAccessible).toBeTruthy()
      })
      it('disallows groups when after live check end date', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
          checkStartDate: moment.utc().subtract(4, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      it('disallows groups when before admin start date', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().add(1, 'days'),
          adminEndDate: moment.utc().subtract(10, 'days'),
          familiarisationCheckStartDate: moment.utc().add(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(3, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      it('allow groups when within live check period', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeTruthy()
      })

      it('disallows hdf before live check period', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().add(1, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().add(2, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isHdfPageAccessible).toBeFalsy()
      })
      it('allows hdf when within live check period', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(4, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(2, 'days'),
          checkEndDate: moment.utc().add(7, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'utc').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isHdfPageAccessible).toBeTruthy()
      })
      it('disallows access to results feature when live check period is active', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(3, 'days'),
          adminEndDate: moment.utc().add(10, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(1, 'days'),
          checkEndDate: moment.utc().add(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isResultFeatureAccessible).toBeFalsy()
      })
      it('disallows access to results feature if attempted to be accessed before the opening Monday time on the allowed day', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(3, 'days'),
          checkStartDate: moment.utc().subtract(6, 'days'),
          checkEndDate: moment.utc().subtract(3, 'days')
        }
        const allowedDateTime = checkWindowData.checkEndDate.day(8).set({ hour: 7 }) // next monday after checkEndDate
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isResultFeatureAccessible).toBeFalsy()
      })
      it('allows access to results feature if live check period is in the past', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().add(2, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(5, 'days'),
          checkStartDate: moment.utc().subtract(6, 'days'),
          checkEndDate: moment.utc().subtract(5, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isResultFeatureAccessible).toBeTruthy()
      })

      describe('providing hdf is submitted', () => {
        it('allows results after the first Monday from check end date', async () => {
          const checkWindowData = {
            id: 1,
            adminStartDate: moment.utc().subtract(10, 'days'),
            adminEndDate: moment.utc().add(2, 'days'),
            familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
            familiarisationCheckEndDate: moment.utc().subtract(5, 'days'),
            checkStartDate: moment.utc().subtract(6, 'days'),
            checkEndDate: moment.utc().subtract(5, 'days')
          }
          const allowedDateTime = moment.utc().set({ hour: 11 })
          spyOn(moment, 'tz').and.returnValue(allowedDateTime)
          const isResultsPageAccessibleForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs(allowedDateTime, checkWindowData, true)
          expect(isResultsPageAccessibleForSubmittedHdfs).toBeTruthy()
        })

        it('disallows results before the first Monday from check end date', async () => {
          const checkWindowData = {
            id: 1,
            adminStartDate: moment.utc().subtract(10, 'days'),
            adminEndDate: moment.utc().add(1, 'days'),
            familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
            familiarisationCheckEndDate: moment.utc().subtract(3, 'days'),
            checkStartDate: moment.utc().subtract(6, 'days'),
            checkEndDate: moment.utc().subtract(1, 'days')
          }
          const allowedDateTime = moment.utc().set({ hour: 11 })
          spyOn(moment, 'tz').and.returnValue(allowedDateTime)
          const isResultsPageAccessibleForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs(allowedDateTime, checkWindowData, true)
          expect(isResultsPageAccessibleForSubmittedHdfs).toBeFalsy()
        })
      })

      describe('providing hdf is not submitted', () => {
        it('disallows results after the first Monday from check end date', async () => {
          const checkWindowData = {
            id: 1,
            adminStartDate: moment.utc().subtract(10, 'days'),
            adminEndDate: moment.utc().add(2, 'days'),
            familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
            familiarisationCheckEndDate: moment.utc().subtract(5, 'days'),
            checkStartDate: moment.utc().subtract(6, 'days'),
            checkEndDate: moment.utc().subtract(5, 'days')
          }
          const allowedDateTime = moment.utc().set({ hour: 11 })
          spyOn(moment, 'tz').and.returnValue(allowedDateTime)
          const isResultsPageAccessibleForSubmittedHdfs = schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForSubmittedHdfs(allowedDateTime, checkWindowData)
          expect(isResultsPageAccessibleForSubmittedHdfs).toBeFalsy()
        })
        it('disallows results before the second Monday after check end date', async () => {
          const checkWindowData = {
            id: 1,
            adminStartDate: moment.utc().subtract(15, 'days'),
            adminEndDate: moment.utc().add(2, 'days'),
            familiarisationCheckStartDate: moment.utc().subtract(12, 'days'),
            familiarisationCheckEndDate: moment.utc().subtract(8, 'days'),
            checkStartDate: moment.utc().subtract(11, 'days'),
            checkEndDate: moment.utc().subtract(8, 'days')
          }
          const allowedDateTime = moment.utc().set({ hour: 11 })
          spyOn(moment, 'tz').and.returnValue(allowedDateTime)
          const isResultsPageAccessibleForUnsubmittedHdfs = schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForUnsubmittedHdfs(allowedDateTime, checkWindowData)
          expect(isResultsPageAccessibleForUnsubmittedHdfs).toBeFalsy()
        })
        it('allows results after the second Monday after check end date', async () => {
          const checkWindowData = {
            id: 1,
            adminStartDate: moment.utc().subtract(25, 'days'),
            adminEndDate: moment.utc().add(2, 'days'),
            familiarisationCheckStartDate: moment.utc().subtract(20, 'days'),
            familiarisationCheckEndDate: moment.utc().subtract(16, 'days'),
            checkStartDate: moment.utc().subtract(18, 'days'),
            checkEndDate: moment.utc().subtract(16, 'days')
          }
          const allowedDateTime = moment.utc().set({ hour: 11 })
          spyOn(moment, 'tz').and.returnValue(allowedDateTime)
          const isResultsPageAccessibleForUnsubmittedHdfs = schoolHomeFeatureEligibilityPresenter.isResultsPageAccessibleForUnsubmittedHdfs(allowedDateTime, checkWindowData)
          expect(isResultsPageAccessibleForUnsubmittedHdfs).toBeTruthy()
        })
      })
    })
    describe('when override is enabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = true
      })
      it('allows both familiarisation and live pin generation if regardless of check window period', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'days'),
          adminEndDate: moment.utc().subtract(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(5, 'days'),
          familiarisationCheckEndDate: moment.utc().subtract(2, 'days'),
          checkStartDate: moment.utc().subtract(4, 'days'),
          checkEndDate: moment.utc().subtract(2, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        spyOn(moment, 'tz').and.returnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
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
