'use strict'
/* global describe beforeEach afterEach it expect */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire')
const Pupil = require('../../models/pupil')
const pupilNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
//const AttendanceCode = require('../../models/attendance-code')

const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason')
const pupilsWithReasonsFormattedMock = require('../mocks/pupils-with-reason-formatted')

/* global beforeEach, describe, it, expect */

describe('Pupils are not taking the check. Service', () => {
  let service
  let sandbox

  function setupService (mock) {
    return proxyquire('../../services/pupils-not-taking-check.service.js', {
      '../models/pupil': sandbox.mock(Pupil)
      .expects('find')
      .chain('sort')
      .resolves(mock)
    })
  }

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('fetchPupilsWithReasons successfully finds pupils', () => {
    beforeEach(() => {
      service = setupService(pupilsWithReasonsMock)
    })

    it('should return a list of pupils with reasons (happy path)', async (done) => {
      try {
        const pupilsWithReasons = await service.fetchPupilsWithReasons(9991001)
        expect(pupilsWithReasons).toEqual(pupilsWithReasonsMock)
        done()
      } catch (error) {
        done('Error found while testing fetchPupilsWithReasons')
      }
    })
  })

  describe('fetchPupilsWithReasons finds no pupils with reasons', () => {
    beforeEach(() => {
      service = setupService({})
    })

    it('should return undefined (unhappy path)', async (done) => {
      try {
        const pupilsWithReasons = await service.fetchPupilsWithReasons(9991001)
        expect(pupilsWithReasons).toEqual(undefined)
        done()
      } catch (error) {
        done('Error found while testing fetchPupilsWithReasons')
      }
    })
  })

  describe('sortPupilsByLastName', () => {
    it('should return expected values (1)', (done) => {
      const sorting = pupilNotTakingCheckService.sortPupilsByLastName('name', 'asc')
      expect(sorting.htmlSortDirection.name).toEqual('desc')
      expect(sorting.htmlSortDirection.reason).toEqual('asc')
      expect(sorting.arrowSortDirection.name).toEqual('sort')
      expect(sorting.arrowSortDirection.reason).toEqual('sort')
      done()
    })

    it('should return expected values (2)', (done) => {
      const sorting = pupilNotTakingCheckService.sortPupilsByLastName('reason', 'desc')
      expect(sorting.htmlSortDirection.name).toEqual('asc')
      expect(sorting.htmlSortDirection.reason).toEqual('asc')
      expect(sorting.arrowSortDirection.name).toEqual('sort')
      expect(sorting.arrowSortDirection.reason).toEqual('sort up')
      done()
    })
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
      done()
    })
  })

  describe('formatPupilsWithReasons', () => {
    it('should return a list of pupils that includes new field reason', async (done) => {
      const afterFormatting = await pupilNotTakingCheckService.formatPupilsWithReasons(attendanceCodesMock, pupilsWithReasonsMock)
        .then(result => {
          return result
        })
      expect(afterFormatting[0].reason).toEqual('Absent')
      expect(afterFormatting[1].reason).toEqual('Left school')
      expect(afterFormatting[2].reason).toEqual('Incorrect registration')
      done()
    })
  })
})
