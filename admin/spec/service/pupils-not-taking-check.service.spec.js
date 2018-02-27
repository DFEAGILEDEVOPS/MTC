'use strict'
/* global describe it expect */

const pupilNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

describe('Pupils are not taking the check. Service', () => {
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
})
