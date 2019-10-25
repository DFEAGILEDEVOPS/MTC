'use strict'

/* global describe, it, expect, fail */

const { isFunction, isArray } = require('ramda-adjunct')

const detectPupilPrefsApiSuccessDuringCheck = require('../../service/detections/pupil-prefs-api-success-during-check')

describe('detectPupilPrefsApiSuccessDuringCheck', () => {
  it('is defined', () => {
    expect(detectPupilPrefsApiSuccessDuringCheck).toBeDefined()
  })

  it('is a function', () => {
    expect(isFunction(detectPupilPrefsApiSuccessDuringCheck)).toBeTrue()
  })

  it('takes a single `data` argument', () => {
    try {
      detectPupilPrefsApiSuccessDuringCheck() // missing arg
      fail()
    } catch (error) {
      expect(error.message).toBe('data should be an object')
    }
  })

  it('produces a report when the PupilPrefsApISuccessEvent is recorded after check start', () => {
    const mockData = {
      checkPayload: {
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-09-17T11:33:55.123Z' },
          {
            'type': 'PupilPrefsAPICallSucceeded',
            'clientTimestamp': '2019-09-17T11:33:55.124Z'
          },
          {
            'type': 'PupilPrefsAPICallSucceeded',
            'clientTimestamp': '2019-09-17T11:33:55.125Z'
          }
        ]
      }
    }
    const r = detectPupilPrefsApiSuccessDuringCheck(mockData)
    expect(isArray(r)).toBeTrue()
    expect(r.length).toBe(1) // duplicates suppressed
    expect(r[0].Message).toBe('Check disrupted by PupilPrefsAPICallSucceeded event')
  })

  it('does not produce a report when the PupilPrefsApISuccessEvent is recorded before check start', () => {
    const mockData = {
      checkPayload: {
        audit: [
          { type: 'CheckStarted', clientTimestamp: '2019-09-17T11:33:55.123Z' },
          {
            'type': 'PupilPrefsAPICallSucceeded',
            'clientTimestamp': '2019-09-17T11:33:55.122Z'
          }
        ]
      }
    }
    const r = detectPupilPrefsApiSuccessDuringCheck(mockData)
    expect(r).toEqual([])
  })
})
