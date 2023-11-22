/* global describe, expect, test */

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
      status: 'Check started'
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
    },
    {
      status: 'Check started'
    }
  ]
  describe('getPresentationData', () => {
    const checkWindowData = {
      checkStartDate: moment.utc().subtract(3, 'days'),
      checkEndDate: moment.utc().add(1, 'days')
    }
    test('collects pupils with errors', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsRequireAction.length).toBe(2)
    })
    test('collects pupils that have not started', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted.length).toBe(3)
    })
    test('collects pupils that are not attending', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsInProgress.length).toBe(1)
    })
    test('collects pupils that are complete', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.pupilsCompleted.length).toBe(7)
    })
    test('displays pupils that have pin generated as not started', () => {
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
    })
    test('displays pupils that have logged in as not started', () => {
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
    })
    test('displays pupils that have unused restarts as not started', () => {
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
    test('displays pupils with Overdue status as "Pupil check not received"', () => {
      const pupilsRequireAction = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Overdue'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilsRequireAction, checkWindowData)
      expect(pupilStatusViewData.pupilsRequireAction[0].status).toBe('Error in processing')
      expect(pupilStatusViewData.pupilsRequireAction[1].status).toBe('Pupil check not received')
    })
    test('collects total pupil count', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.totalPupilsCount).toBe(15)
    })
    test('collects formatted checkEndDate', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.liveCheckEndDate).toBe(checkWindowData.checkEndDate.format('D MMMM YYYY'))
    })
    test('collects remaining live check days', () => {
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.remainingLiveCheckDays).toBe(checkWindowData.checkEndDate.diff(moment.utc(), 'days'))
    })
  })
})
