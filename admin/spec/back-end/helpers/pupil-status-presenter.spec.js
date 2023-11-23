/* global describe, expect, test */

const moment = require('moment')

const pupilStatusPresenter = require('../../../helpers/pupil-status-presenter')

describe('pupilStatusPresenter', () => {
  describe('getPresentationData', () => {
    const checkWindowData = {
      checkStartDate: moment.utc().subtract(3, 'days'),
      checkEndDate: moment.utc().add(1, 'days')
    }
    test('collects pupils with errors', () => {
      const pupilData = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Error in processing'
        },
        {
          status: 'Complete'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsRequireAction.length).toBe(2)
    })
    test('collects pupils that have not started', () => {
      const pupilData = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Restart'
        },
        {
          status: 'Not started'
        },
        {
          reason: 'Not attending'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsNotStarted.length).toBe(2)
    })
    test('collects pupils that have started the check', () => {
      const pupilData = [
        {
          status: 'Check started'
        },
        {
          status: 'Error in processing'
        },
        {
          status: 'PIN generated'
        },
        {
          reason: 'Not attending'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsInProgress.length).toBe(2)
    })
    test('collects pupils that are not attending', () => {
      const pupilData = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Error in processing'
        },
        {
          reason: 'Not attending'
        },
        {
          reason: 'Left School'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsCompleted.length).toBe(2)
    })
    test('collects pupils that are complete', () => {
      const pupilData = [
        {
          status: 'Complete'
        },
        {
          status: 'Error in processing'
        },
        {
          reason: 'Not attending'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsCompleted[0].status).toBe('Complete')
      expect(pupilStatusViewData.pupilsCompleted[1].reason).toBe('Not attending')
      expect(pupilStatusViewData.pupilsCompleted.length).toBe(2)
    })
    test('displays pupils that have pin generated as in progress', () => {
      const notStartedPupils = [
        {
          status: 'Not started'
        },
        {
          status: 'PIN generated'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(notStartedPupils, checkWindowData)
      expect(pupilStatusViewData.pupilsInProgress[0].status).toBe('PIN generated')
      expect(pupilStatusViewData.pupilsInProgress.length).toBe(1)
    })
    test('displays pupils that have logged in as logged in', () => {
      const pupilData = [
        {
          status: 'Not started'
        },
        {
          status: 'Logged in'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupilData, checkWindowData)
      expect(pupilStatusViewData.pupilsInProgress[0].status).toBe('Logged in')
      expect(pupilStatusViewData.pupilsInProgress.length).toBe(1)
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
      const pupils = [
        {
          status: 'Error in processing'
        },
        {
          status: 'Overdue'
        },
        {
          reason: 'Not attending'
        }
      ]
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.totalPupilsCount).toBe(pupils.length)
    })
    test('collects formatted checkEndDate', () => {
      const pupils = []
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.liveCheckEndDate).toBe(checkWindowData.checkEndDate.format('D MMMM YYYY'))
    })
    test('collects remaining live check days', () => {
      const pupils = []
      const pupilStatusViewData = pupilStatusPresenter.getPresentationData(pupils, checkWindowData)
      expect(pupilStatusViewData.remainingLiveCheckDays).toBe(checkWindowData.checkEndDate.diff(moment.utc(), 'days'))
    })
  })
})
