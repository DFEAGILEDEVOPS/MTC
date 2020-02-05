/* global describe, expect, it */

const moment = require('moment')

const pupilStatusPresenter = require('../../../helpers/pupil-status-presenter')

describe('pupilStatusPresenter', () => {
  const pupils = [
    {
      status: 'Error in processing'
    },
    {
      status: 'Error in processing'
    },
    {
      status: 'Not started'
    },
    {
      status: 'Not started'
    },
    {
      status: 'Not started'
    },
    {
      status: 'Incomplete'
    },
    {
      status: 'Processing'
    },
    {
      reason: 'Incorrect registration'
    },
    {
      reason: 'Just arrived with EAL'
    },
    {
      reason: 'Incorrect registration'
    },
    {
      reason: 'Just arrived with EAL'
    },
    {
      reason: 'Incorrect registration'
    },
    {
      reason: 'Just arrived with EAL'
    },
    {
      status: 'Complete'
    }
  ]
  describe('getPresentationData', () => {
    const checkWindowData = {
      checkStartDate: moment.utc().subtract(3, 'days'),
      checkEndDate: moment.utc().add(1, 'days')
    }
    it('collects pupils with errors', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsWithErrors.length).toBe(3)
    })
    it('collects pupils that have not started', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted.length).toBe(4)
    })
    it('collects pupils that are not attending', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotAttending.length).toBe(6)
    })
    it('collects pupils that are complete', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsCompleted.length).toBe(1)
    })
    it('collects total pupil count', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.totalPupilsCount).toBe(14)
    })
    it('collects formatted checkEndDate', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.liveCheckEndDate).toBe(checkWindowData.checkEndDate.format('D MMMM YYYY'))
    })
    it('collects remaining live check days', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.remainingLiveCheckDays).toBe(checkWindowData.checkEndDate.diff(checkWindowData.checkStartDate, 'days'))
    })
  })
})
