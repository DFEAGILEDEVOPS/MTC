'use strict'
/* global describe it expect spyOn */

const pupilDataService = require('../../../services/data-access/pupil.data.service')
const pupilIdentificationFlag = require('../../../services/pupil-identification-flag.service')
const pupilNotTakingCheckService = require('../../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../../services/data-access/pupils-not-taking-check.data.service')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

describe('Pupils are not taking the check. Service', () => {
  describe('#sortPupilsByReason', () => {
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

  describe('#getPupilsWithReasonsForDfeNumber', () => {
    it('should return a list of pupils', async (done) => {
      spyOn(pupilDataService, 'sqlFindSortedPupilsWithAttendanceReasons').and.returnValue(pupilsWithReasonsFormattedMock)
      spyOn(pupilIdentificationFlag, 'addIdentificationFlags').and.returnValue(pupilsWithReasonsFormattedMock)
      const pupils = await pupilNotTakingCheckService.getPupilsWithReasonsForDfeNumber()

      expect(pupils[0].foreName).toBe('Sarah')
      expect(pupils[0].lastName).toBe('Connor')
      expect(pupilDataService.sqlFindSortedPupilsWithAttendanceReasons).toHaveBeenCalled()
      expect(pupilIdentificationFlag.addIdentificationFlags).toHaveBeenCalled()
      done()
    })
  })

  describe('#getPupilsWithReasons', () => {
    it('should return a list of pupils', async (done) => {
      spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithReasons').and.returnValue(pupilsWithReasonsFormattedMock)
      spyOn(pupilIdentificationFlag, 'addIdentificationFlags').and.returnValue(pupilsWithReasonsFormattedMock)
      const pupils = await pupilNotTakingCheckService.getPupilsWithReasons()

      expect(pupils[0].foreName).toBe('Sarah')
      expect(pupils[0].lastName).toBe('Connor')
      expect(pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons).toHaveBeenCalled()
      expect(pupilIdentificationFlag.addIdentificationFlags).toHaveBeenCalled()
      done()
    })
  })

  describe('#getPupilSlugs', () => {
    it('should return a slugUrl when reqBody is a string', () => {
      const reqBody = 'pupilSlug'
      const expectedReqBody = [reqBody]
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })

    it('should return a slugUrl when reqBody is an object', () => {
      const reqBody = {}
      reqBody.pupilSlug = 'pupilSlug'
      const expectedReqBody = ['pupilSlug']
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })

    it('should return a slugUrl when reqBody is an array', () => {
      const reqBody = ['pupilSlug']
      const expectedReqBody = ['pupilSlug']
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })
  })
})
