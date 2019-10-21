'use strict'

/* global describe expect it */

const getDuration = require('./get-duration')
const { isFunction } = require('ramda-adjunct')
const moment = require('moment')

describe('getDuration', () => {
  it('is defined', () => {
    expect(getDuration).toBeDefined()
  })

  it('is a function', () => {
    expect(isFunction(getDuration)).toBeTrue()
  })

  it('reports a positive duration', () => {
    const m1 = moment('2019-10-19T14:10:21', moment.ISO_8601, true)
    const m2 = moment(m1).add(4.251, 'seconds')
    expect(getDuration(m2, m1)).toBe('4.3')
  })

  it('reports a negative duration', () => {
    const m1 = moment('2019-10-19T14:10:21', moment.ISO_8601, true)
    const m2 = moment(m1).subtract(1.342, 'seconds')
    expect(getDuration(m2, m1)).toBe('-1.3')
  })

  it('reports zero duration', () => {
    const m1 = moment('2019-10-19T14:10:21', moment.ISO_8601, true)
    const m2 = moment(m1)
    expect(getDuration(m2, m1)).toBe('0.0')
  })

  it('handles invalid moment objects in arg1', () => {
    const m1 = moment('2019-10-19T14:10:21', moment.ISO_8601, true)
    const m2 = moment('2019-02-30T14:14:23')
    expect(getDuration(m2, m1)).toBe('')
  })

  it('handles invalid moment objects in arg2', () => {
    const m1 = moment('2019-10-19T14:10:21', moment.ISO_8601, true)
    const m2 = moment('2019-02-30T14:14:23')
    expect(getDuration(m1, m2)).toBe('')
  })

  it('handles invalid moment objects in arg1 and arg2', () => {
    const m1 = moment('2019-02-30T14:14:23')
    const m2 = moment('2019-02-30T14:14:24')
    expect(getDuration(m2, m1)).toBe('')
  })
})
