
const moment = require('moment-timezone')

const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const config = require('../../../config')

describe('schoolHomeFeatureEligibilityPresenter', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })
  describe('getPresentationData', () => {
    describe('when override is disabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = false
      })
      test('allows both familiarisation and live pin generation if within admin period and within check periods ', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      test('disallows both familiarisation and live pin generation if check window is in the past', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      test('disallows both familiarisation and live pin generation if check window is in the future', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeTruthy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      test('disallow live pin generation and allows familiarisation pin generation if within only familiarisation period', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeTruthy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      test('disallows any familiarisation pin generation when date is within that period and outside of available times', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeFalsy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeTruthy()
      })
      test('disallows any live pin generation when date is within that period and outside of available times', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      test('disallows restarts and groups when outside of a live check window', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(disallowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isFamiliarisationPinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isLivePinGenerationAllowed).toBeFalsy()
        expect(pinGenerationEligibilityData.isWithinFamiliarisationUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isWithinLiveUnavailableHours).toBeTruthy()
        expect(pinGenerationEligibilityData.isFamiliarisationInTheFuture).toBeFalsy()
        expect(pinGenerationEligibilityData.isLiveInTheFuture).toBeFalsy()
      })
      test('disallows restarts when outside of a live check window', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isRestartsPageAccessible).toBeFalsy()
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      test('allows restarts when inside of a live check window', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isRestartsPageAccessible).toBeTruthy()
      })
      test('disallows groups when after live check end date', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      test('disallows groups when before admin start date', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeFalsy()
      })
      test('allow groups when within live check period', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isGroupsPageAccessible).toBeTruthy()
      })
      test('disallows hdf before live check period', async () => {
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
        jest.spyOn(moment, 'utc').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isHdfPageAccessible).toBeFalsy()
      })
      test('allows hdf when within live check period', async () => {
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
        jest.spyOn(moment, 'utc').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isHdfPageAccessible).toBeTruthy()
      })
      test('calculates when the check window is closed', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'day'),
          adminEndDate: moment.utc().add(1, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(9, 'days'),
          familiarisationCheckEndDate: moment.utc().add(5, 'days'),
          checkStartDate: moment.utc().subtract(5, 'day'),
          checkEndDate: moment.utc().subtract(1, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        jest.spyOn(moment, 'utc').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isCheckWindowClosed).toBe(true)
      })
      test('calculates when the check window is open', async () => {
        const checkWindowData = {
          id: 1,
          adminStartDate: moment.utc().subtract(10, 'day'),
          adminEndDate: moment.utc().add(2, 'days'),
          familiarisationCheckStartDate: moment.utc().subtract(9, 'days'),
          familiarisationCheckEndDate: moment.utc().add(1, 'days'),
          checkStartDate: moment.utc().subtract(5, 'day'),
          checkEndDate: moment.utc().add(1, 'days')
        }
        const allowedDateTime = moment.utc().set({ hour: 11 })
        jest.spyOn(moment, 'utc').mockReturnValue(allowedDateTime)
        const pinGenerationEligibilityData = schoolHomeFeatureEligibilityPresenter.getPresentationData(checkWindowData)
        expect(pinGenerationEligibilityData.isCheckWindowClosed).toBe(false)
      })
    })
    describe('when override is enabled', () => {
      beforeEach(() => {
        config.OverridePinExpiry = true
      })
      test('allows both familiarisation and live pin generation if regardless of check window period', async () => {
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
        jest.spyOn(moment, 'tz').mockReturnValue(allowedDateTime)
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
