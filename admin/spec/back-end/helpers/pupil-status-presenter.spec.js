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
    it('displays pupils that have pin generated as not started', () => {
      const notStartedPupils = [
        {
          status: 'Not started'
        },
        {
          status: 'PIN generated'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(notStartedPupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted[0].status).toBe('Not started')
      expect(pupilStatusViewData.pupilsNotStarted[1].status).toBe('Not started')
    })
    it('displays pupils that have logged in as not started', () => {
      const notStartedPupils = [
        {
          status: 'Not started'
        },
        {
          status: 'Logged in'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(notStartedPupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted[0].status).toBe('Not started')
      expect(pupilStatusViewData.pupilsNotStarted[1].status).toBe('Not started')
    })
    it('displays pupils that have unused restarts as not started', () => {
      const notStartedPupils = [
        {
          status: 'Not started'
        },
        {
          status: 'Restart'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(notStartedPupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted[0].status).toBe('Not started')
      expect(pupilStatusViewData.pupilsNotStarted[1].status).toBe('Not started')
    })
    it('displays pupils with incomplete status as "Pupil check not received"', () => {
      const pupilsWithErrors = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Incomplete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilsWithErrors, checkWindowData)
      expect(pupilStatusViewData.pupilsWithErrors[0].status).toBe('Error in processing')
      expect(pupilStatusViewData.pupilsWithErrors[1].status).toBe('Pupil check not received')
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
      expect(pupilStatusViewData.remainingLiveCheckDays).toBe(checkWindowData.checkEndDate.diff(moment.utc(), 'days'))
    })
  })
})
