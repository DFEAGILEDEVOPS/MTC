'use strict'
/* global describe test expect afterEach jest */

const pupilNotTakingCheckService = require('../../../services/pupils-not-taking-check.service')
const pupilsNotTakingCheckDataService = require('../../../services/data-access/pupils-not-taking-check.data.service')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

describe('Pupils are not taking the check. Service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#sortPupilsByReason', () => {
    test('should return a list ordered by reason not equal to the original (as per mock order)', () => {
      const beforeSorting = Object.assign({}, pupilsWithReasonsFormattedMock)
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'asc')
      expect(beforeSorting).not.toEqual(afterSorting)
    })

    test('returns list ordered by reason asc', () => {
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'asc')
      expect(afterSorting[0].reason).toEqual('Absent')
      expect(afterSorting[1].reason).toEqual('Incorrect registration')
      expect(afterSorting[2].reason).toEqual('Left school')
      expect(afterSorting[3].reason).toEqual('-')
    })

    test('returns list ordered by reason desc', () => {
      const afterSorting = pupilNotTakingCheckService.sortPupilsByReason(pupilsWithReasonsFormattedMock, 'desc')
      expect(afterSorting[0].reason).toEqual('Left school')
      expect(afterSorting[1].reason).toEqual('Incorrect registration')
      expect(afterSorting[2].reason).toEqual('Absent')
      expect(afterSorting[3].reason).toEqual('-')
    })
  })

  describe('#getPupilsWithReasons', () => {
    const role = 'TEACHER'
    test('should return a list of pupils', async () => {
      jest.spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithReasons').mockResolvedValue(pupilsWithReasonsFormattedMock)
      const pupils = await pupilNotTakingCheckService.getPupilsWithReasons(1, role)
      expect(pupils[0].foreName).toBe('Sarah')
      expect(pupils[0].lastName).toBe('Connor')
      expect(pupilsNotTakingCheckDataService.sqlFindPupilsWithReasons).toHaveBeenCalled()
    })
  })

  describe('#getPupilsWithoutReasons', () => {
    test('should return a list of pupils', async () => {
      jest.spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithoutReasons').mockResolvedValue(pupilsWithReasonsFormattedMock)
      const pupils = await pupilNotTakingCheckService.getPupilsWithoutReasons(1)
      expect(pupils[0].foreName).toBe('Sarah')
      expect(pupils[0].lastName).toBe('Connor')
      expect(pupilsNotTakingCheckDataService.sqlFindPupilsWithoutReasons).toHaveBeenCalled()
    })
  })

  describe('#getPupilsWithoutReasonsInAdminPeriod', () => {
    test('should return a list of sorted pupils', async () => {
      jest.spyOn(pupilsNotTakingCheckDataService, 'sqlFindPupilsWithoutReasonsInAdminPeriod').mockResolvedValue(pupilsWithReasonsFormattedMock)
      const pupils = await pupilNotTakingCheckService.getPupilsWithoutReasonsInAdminPeriod(1)
      expect(pupils[0].foreName).toBe('Sarah')
      expect(pupils[0].lastName).toBe('Connor')
      expect(pupilsNotTakingCheckDataService.sqlFindPupilsWithoutReasonsInAdminPeriod).toHaveBeenCalled()
    })
  })

  describe('#getPupilSlugs', () => {
    test('should return a slugUrl when reqBody is a string', () => {
      const reqBody = 'pupilSlug'
      const expectedReqBody = [reqBody]
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })

    test('should return a slugUrl when reqBody is an object', () => {
      const reqBody = {}
      reqBody.pupilSlug = 'pupilSlug'
      const expectedReqBody = ['pupilSlug']
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })

    test('should return a slugUrl when reqBody is an array', () => {
      const reqBody = ['pupilSlug']
      const expectedReqBody = ['pupilSlug']
      const pupilSlug = pupilNotTakingCheckService.getPupilSlugs(reqBody)
      expect(pupilSlug).toEqual(expectedReqBody)
    })
  })
})
