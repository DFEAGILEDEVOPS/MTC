'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const AttendanceCode = require('../../../models/attendance-code')

const pupilsWithReasonsMock = require('../../mocks/pupils-with-reason')
const attendanceCodesMock = require('../../mocks/attendance-codes')

describe('pupils-not-taking-check.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#fetchPupilsWithReasons', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(Pupil).expects('find').chain('sort').resolves(pupilsWithReasonsMock)
      service = proxyquire('../../../services/data-access/pupils-not-taking-check.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('should return a list of pupils with reasons', () => {
      service.fetchPupilsWithReasons(9991001)
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#getAttendanceCodes', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(AttendanceCode).expects('find').chain('sort').resolves(attendanceCodesMock)
      service = proxyquire('../../../services/data-access/pupils-not-taking-check.data.service', {
        '../../models/attencance-code': AttendanceCode
      })
    })

    it('should return a list of attendance codes', () => {
      service.getAttendanceCodes()
      expect(mock.verify()).toBe(true)
    })
  })
})
