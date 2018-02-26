'use strict'
/* global describe beforeEach afterEach it expect */

const sinon = require('sinon')
const pupilNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

/* global beforeEach, describe, it, expect */

describe('Pupils are not taking the check. Service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('sortPupilsByReason', () => {
    it('should return a list ordered by reason not equal to the original (as per mock order)', (done) => {
      const beforeSorting = Object.assign({}, pupilsWithReasonsFormattedMock)
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'asc')
      expect(beforeSorting).not.toEqual(afterSorting)
      done()
    })

    it('returns list ordered by reason asc', (done) => {
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'asc')
      expect(afterSorting[0].reason).toEqual('Absent')
      expect(afterSorting[1].reason).toEqual('Incorrect registration')
      expect(afterSorting[2].reason).toEqual('Left school')
      expect(afterSorting[3].reason).toEqual('N/A')
      done()
    })

    it('returns list ordered by reason desc', (done) => {
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'desc')
      expect(afterSorting[0].reason).toEqual('Left school')
      expect(afterSorting[1].reason).toEqual('Incorrect registration')
      expect(afterSorting[2].reason).toEqual('Absent')
      expect(afterSorting[3].reason).toEqual('N/A')
      done()
    })
  })

  describe('formatPupilsWithReasons', () => {
    it('should return a list of pupils that includes new field "reason"', async (done) => {
      const afterFormatting = await pupilNotTakingCheckService.formatPupilsWithReasons(attendanceCodesMock, pupilsWithReasonsMock)
        .then(result => {
          return result
        })
      expect(afterFormatting[0].reason).toEqual('Incorrect registration')
      expect(afterFormatting[1].reason).toEqual('Absent')
      expect(afterFormatting[2].reason).toEqual('Left school')
      expect(afterFormatting[3].reason).toEqual('N/A')
      done()
    })

    it('should return 1 record with field "highlight" equal true ', async (done) => {
      const afterFormatting = await pupilNotTakingCheckService.formatPupilsWithReasons(attendanceCodesMock, pupilsWithReasonsMock, ['595cd5416e5cv88e69ed2632'])
      .then(result => {
        return result
      })
      expect(afterFormatting[1].highlight).toEqual(true)
      done()
    })

    it('should return 3 records with "highlight" equal false ', async (done) => {
      const afterFormatting = await pupilNotTakingCheckService.formatPupilsWithReasons(attendanceCodesMock, pupilsWithReasonsMock, ['595cd5416e5cv88e69ed2632'])
      .then(result => {
        return result
      })
      expect(afterFormatting[0].highlight).toEqual(false)
      expect(afterFormatting[2].highlight).toEqual(false)
      expect(afterFormatting[3].highlight).toEqual(false)
      done()
    })
  })
})
