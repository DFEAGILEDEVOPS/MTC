/* global describe, expect, it */

const moment = require('moment')

const pupilStatusPresenter = require('../../../helpers/pupil-status-presenter')

describe('pupilStatusPresenter', () => {
  describe('getPresentationData', () => {
    const checkWindowData = {
      checkStartDate: moment.utc().subtract(3, 'days'),
      checkEndDate: moment.utc().add(1, 'days')
    }
    it('collects pupils with errors', () => {
      const pupils = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Incomplete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsWithErrors.length).toBe(2)
    })
    it('collects pupils that have not started', () => {
      const pupils = [
        {
          status: 'Not started'
        },
        {
          status: 'Processing'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted.length).toBe(2)
    })
    it('collects pupils that are not attending', () => {
      const pupils = [
        {
          reason: 'Incorrect registration'
        },
        {
          reason: 'Just arrived with EAL'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotAttending.length).toBe(2)
    })
    it('collects pupils that are complete', () => {
      const pupils = [
        {
          status: 'Complete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsCompleted.length).toBe(1)
    })
    it('collects total pupil count', () => {
      const pupils = [
        {
          status: 'Complete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.totalPupilsCount).toBe(1)
    })
    it('collects formatted checkEndDate', () => {
      const pupils = [
        {
          status: 'Complete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.liveCheckEndDate).toBe(checkWindowData.checkEndDate.format('D MMMM YYYY'))
    })
    it('collects remaining live check days', () => {
      const pupils = [
        {
          status: 'Complete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.remainingLiveCheckDays).toBe(checkWindowData.checkEndDate.diff(checkWindowData.checkStartDate, 'days'))
    })
  })
})
