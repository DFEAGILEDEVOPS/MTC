'use strict'

/* global beforeEach, describe, it, expect */

const AttendanceCode = require('../../models/attendance-code')

describe('AttendanceCode schema', function () {
  let attendanceCode

  beforeEach(function () {
    attendanceCode = new AttendanceCode({
      reason: 'reason 1',
      code: 1
    })
  })

  it('validates a correct setting entry', function (done) {
    attendanceCode.validate(error => {
      expect(error).toBe(null)
      done()
    })
  })

  it('requires a reason', function (done) {
    attendanceCode.reason = undefined
    attendanceCode.validate(error => {
      expect(error.errors.reason).toBeDefined()
      done()
    })
  })

  it('requires a code', function (done) {
    attendanceCode.code = undefined
    attendanceCode.validate(error => {
      expect(error.errors.code).toBeDefined()
      done()
    })
  })
})
