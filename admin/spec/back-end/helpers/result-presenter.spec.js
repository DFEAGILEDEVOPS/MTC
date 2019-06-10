/* global describe, expect, it */

const moment = require('moment')
const resultPresenter = require('../../../helpers/result-presenter')

describe('resultPresenter', () => {
  describe('getResultsViewData', () => {
    it('provides a score if no attendance reason is detected', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: 5,
        reason: null,
        group_id: 1,
        checkStatusCode: 'CMP',
        pupilStatusCode: 'COMPLETED'
      }]
      const { pupilData } = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: 5,
        status: '',
        group_id: 1
      }])
    })
    it('returns a dash as score when attendance reason is detected', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: 5,
        reason: 'Absent',
        group_id: 1
      }]
      const { pupilData } = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: '-',
        status: 'Absent',
        group_id: 1
      }])
    })
    it('returns incomplete status if check status is not received and pupil status is started', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: '',
        reason: '',
        group_id: 1,
        checkStatusCode: 'NTR',
        pupilStatusCode: 'STARTED'
      }]
      const { pupilData } = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: '-',
        status: 'Incomplete',
        group_id: 1
      }])
    })
    it('returns did not participate if pupil status code is unallocated and no check status code is provided', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: '',
        reason: '',
        group_id: 1,
        checkStatusCode: null,
        pupilStatusCode: 'UNALLOC'
      }]
      const { pupilData } = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: '-',
        status: 'Did not participate',
        group_id: 1
      }])
    })
    it('returns did not attempt the restart if pupil status code is unallocated and check status is CMP', () => {
      const dateOfBirth = moment.utc().subtract(7, 'year')
      const pupils = [{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        dateOfBirth: dateOfBirth,
        mark: '',
        reason: '',
        group_id: 1,
        checkStatusCode: 'CMP',
        pupilStatusCode: 'UNALLOC'
      }]
      const { pupilData } = resultPresenter.getResultsViewData(pupils)
      expect(pupilData).toEqual([{
        foreName: 'foreName',
        lastName: 'lastName',
        middleNames: 'middleNames',
        fullName: 'lastName, foreName',
        dateOfBirth: dateOfBirth,
        score: '-',
        status: 'Did not attempt the restart',
        group_id: 1
      }])
    })
  })
  describe('formatScore', () => {
    it('returns score with 1 decimal point', () => {
      const scoreValue = 7.8976
      const score = resultPresenter.formatScore(scoreValue)
      expect(score.toString().split('.')[1].length).toBe(1)
    })
    it('returns undefined if score passed in undefined', () => {
      const scoreValue = undefined
      const score = resultPresenter.formatScore(scoreValue)
      expect(score).toBeUndefined()
    })
  })
})
