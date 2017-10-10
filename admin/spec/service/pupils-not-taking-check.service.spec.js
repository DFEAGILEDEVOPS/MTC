'use strict'

const proxyquire = require('proxyquire').noCallThru()
const attendanceCodesMock = require('../mocks/attendance-codes')
const MongooseModelMock = require('../mocks/mongoose-model-mock')

/* global beforeEach, describe, it, expect */

describe('Pupils are not taking the check. Service', () => {
  let service

  function setupService (cb) {
    return proxyquire('../../services/pupils-not-taking-check.service', {
      '../models/attendance-code': new MongooseModelMock(cb)
    })
  }

  describe('fetchAttendanceCodes successfully finds documents', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(attendanceCodesMock) })
    })

    it('returns an object when called', async (done) => {
      try {
        const attendanceCodes = await service.fetchAttendanceCodes()
        expect(attendanceCodes).toEqual(attendanceCodesMock)
        done()
      } catch (error) {
        done('Error found while testing fetchAttendanceCodes')
      }
    })
  })

  describe('fetchAttendanceCodes does not find documents', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(null) })
    })

    it('returns an error', async (done) => {
      try {
        const attendanceCodes = await service.fetchAttendanceCodes()
        console.log('UT', attendanceCodes)
        expect(attendanceCodes).toEqual(null)
        done()
      } catch (error) {
        done('Error found while testing fetchAttendanceCodes')
      }
    })
  })
})
