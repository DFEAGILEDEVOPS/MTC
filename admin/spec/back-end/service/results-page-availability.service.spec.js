'use strict'
/* global describe, it, expect */

const moment = require('moment-timezone')

const resultPageAvailabilityService = require('../../../services/results-page-availability.service')

describe('results-page-availability.service', () => {
  describe('isResultsFeatureAccessible', () => {
    it('disallows access to results feature when live check period is active', () => {
      const checkWindowData = {
        id: 1,
        adminStartDate: moment.utc().subtract(3, 'days'),
        adminEndDate: moment.utc().add(10, 'days'),
        familiarisationCheckStartDate: moment.utc().subtract(2, 'days'),
        familiarisationCheckEndDate: moment.utc().add(5, 'days'),
        checkStartDate: moment.utc().subtract(1, 'days'),
        checkEndDate: moment.utc().add(5, 'days')
      }
      const currentDate = moment.utc().set({ hour: 11 })
      const isResultsFeatureAccessible = resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, checkWindowData)
      expect(isResultsFeatureAccessible).toBeFalsy()
    })
    it('disallows access to results feature if attempted to be accessed before the opening Monday time on the allowed day', () => {
      const checkWindowData = {
        id: 1,
        adminStartDate: moment.utc().subtract(10, 'days'),
        adminEndDate: moment.utc().subtract(1, 'days'),
        familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
        familiarisationCheckEndDate: moment.utc().subtract(3, 'days'),
        checkStartDate: moment.utc().subtract(6, 'days'),
        checkEndDate: moment.utc().subtract(3, 'days')
      }
      const currentDate = checkWindowData.checkEndDate
        .clone().add(1, 'weeks').isoWeekday('Monday')
        .set({ hour: 7, minutes: 0, seconds: 0 })
      const isResultsFeatureAccessible = resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, checkWindowData)
      expect(isResultsFeatureAccessible).toBeFalsy()
    })
    it('allows access to results feature if live check period is in the past', () => {
      const checkWindowData = {
        id: 1,
        adminStartDate: moment.utc().subtract(15, 'days'),
        adminEndDate: moment.utc().add(2, 'days'),
        familiarisationCheckStartDate: moment.utc().subtract(8, 'days'),
        familiarisationCheckEndDate: moment.utc().subtract(10, 'days'),
        checkStartDate: moment.utc().subtract(6, 'days'),
        checkEndDate: moment.utc().subtract(10, 'days')
      }
      const currentDate = moment.utc().set({ hour: 11 })
      const isResultsFeatureAccessible = resultPageAvailabilityService.isResultsFeatureAccessible(currentDate, checkWindowData)
      expect(isResultsFeatureAccessible).toBeTruthy()
    })
  })
  describe('isResultsPageAccessibleForIncompleteHdfs', () => {
    describe('providing hdf is not submitted', () => {
      it('disallows results before the second Monday after check end date', () => {
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
        const isResultsPageAccessibleForIncompleteHdfs = resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs(allowedDateTime, checkWindowData, false)
        expect(isResultsPageAccessibleForIncompleteHdfs).toBeFalsy()
      })
      it('allows results after the second Monday after check end date', () => {
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
        const isResultsPageAccessibleForIncompleteHdfs = resultPageAvailabilityService.isResultsPageAccessibleForIncompleteHdfs(allowedDateTime, checkWindowData, false)
        expect(isResultsPageAccessibleForIncompleteHdfs).toBeTruthy()
      })
    })
  })
})
