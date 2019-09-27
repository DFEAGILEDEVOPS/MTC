'use strict'
/* global describe, expect, it */

const moment = require('moment')
const detectCheckCompleteDate = require('../../service/detections/get-check-complete-date')

const p1 = {
  audit: [
    { type: 'CheckSubmissionPending', clientTimestamp: '2019-05-31 13:20:31.123Z' }
  ]
}

const p2 = {
  audit: [
    { type: 'fooType', clientTimestamp: '2019-05-31 13:20:31.123Z' }
  ]
}

const p3 = {
  audit: [
    { type: 'CheckSubmissionPending' }
  ]
}

describe('#detectCheckCompleteDate', () => {
  it('returns the clientTimestamp if found', () => {
    const t1 = detectCheckCompleteDate(p1)
    expect(moment.isMoment(t1))
    expect(t1.toString()).toBe('Fri May 31 2019 14:20:31 GMT+0100')
  })

  it('returns undefined if the payload is not an object', () => {
    const t1 = detectCheckCompleteDate([])
    expect(t1).toBeUndefined()
  })

  it('returns undefined if the payload does not have an `audit` prop', () => {
    const t1 = detectCheckCompleteDate({})
    expect(t1).toBeUndefined()
  })

  it('returns undefined if there isnt a `CheckSubmissionPending` event', () => {
    const t1 = detectCheckCompleteDate(p2)
    expect(t1).toBeUndefined()
  })

  it('returns undefined if there isnt a `clientTimestamp` prop', () => {
    const t1 = detectCheckCompleteDate(p3)
    expect(t1).toBeUndefined()
  })
})
