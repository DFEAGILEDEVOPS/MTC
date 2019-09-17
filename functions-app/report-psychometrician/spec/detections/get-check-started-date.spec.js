'use strict'

/* global describe expect it */
const moment = require('moment')
const getCheckStartedDate = require('../../service/detections/get-check-started-date')

describe('#getCheckStartedDate', () => {
  const d1 = moment()
  const payload1 = {
    audit: [
      { type: 'CheckStarted', clientTimestamp: '2019-09-17T11:33:55.123Z' }
    ]
  }
  const payload2 = {
    foo: [
      { type: 'CheckStarted', clientTimestamp: '2019-09-17T11:33:55.123Z' }
    ]
  }
  const payload3 = {
    audit: [
      { type: 'FooType', clientTimestamp: '2019-09-17T11:33:55.123Z' }
    ]
  }
  const payload4 = {
    audit: [
      { type: 'CheckStarted' }
    ]
  }

  it('returns the date if a date is passed in', () => {
    const res = getCheckStartedDate(d1, null)
    expect(res).toBe(d1)
  })

  it('gets the started date from the audit if the 1st param is an object', () => {
    const res = getCheckStartedDate({}, payload1)
    expect(res.toString()).toBe('Tue Sep 17 2019 12:33:55 GMT+0100')
  })

  it('returns undefined if the second param does not have the check started date #1', () => {
    const res = getCheckStartedDate({}, [])
    expect(res).toBe(undefined)
  })

  it('returns undefined if the second param does not have the check started date #2', () => {
    const res = getCheckStartedDate({}, payload2)
    expect(res).toBe(undefined)
  })

  it('returns undefined if the second param does not have the check started date #3', () => {
    const res = getCheckStartedDate({}, payload3)
    expect(res).toBe(undefined)
  })

  it('returns undefined if the second param does not have the check started date #4', () => {
    const res = getCheckStartedDate({}, payload4)
    expect(res).toBe(undefined)
  })

  it('returns a moment date if it gets the date from the audit log', () => {
    const res = getCheckStartedDate({}, payload1)
    expect(moment.isMoment(res)).toBe(true)
  })
})
