'use strict'
/* global describe beforeEach afterEach it expect */

const sinon = require('sinon')
require('sinon-mongoose')
const proxyquire = require('proxyquire')
const Pupil = require('../../models/pupil')
const pupilNotTakingCheckService = require('../../services/pupils-not-taking-check.service')
//const AttendanceCode = require('../../models/attendance-code')

//const attendanceCodesMock = require('../mocks/attendance-codes')
const pupilsWithReasonsMock = require('../mocks/pupils-with-reason')

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

    it('returns a list of pupils with reasons (happy path)', async (done) => {
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

    it('returns a empty (unhappy path)', async (done) => {
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
    it('returns expected values', (done) => {
      const sorting = pupilNotTakingCheckService.sortPupilsByLastName('name', 'asc')
      expect(sorting.htmlSortDirection.name).toEqual('desc')
      expect(sorting.htmlSortDirection.reason).toEqual('asc')
      expect(sorting.arrowSortDirection.name).toEqual('sort')
      expect(sorting.arrowSortDirection.reason).toEqual('sort')
      done()
    })
  })
})
