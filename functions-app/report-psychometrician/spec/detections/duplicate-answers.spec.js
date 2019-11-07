'use strict'

/* global describe expect it fail */
const detectDuplicateAnswerEvents = require('../../service/detections/detect-duplicate-answer-events')
const { isFunction, isPlainObj } = require('ramda-adjunct')

describe('detect duplicate answers', () => {
  it('is defined', () => {
    expect(detectDuplicateAnswerEvents).toBeDefined()
  })

  it('is a function', () => {
    expect(isFunction(detectDuplicateAnswerEvents)).toBeTrue()
  })

  it('takes an object as the only arg', () => {
    try {
      detectDuplicateAnswerEvents()
      fail()
    } catch (error) {
      expect(error.message).toBe('data should be an object')
    }
  })

  it('reports on a single DuplicateAnswerError event', () => {
    const mockData = {
      checkPayload: {
        audit: [
          {
            type: 'DuplicateAnswerError',
            data: {
              sequenceNumber: 1
            }
          }
        ]
      }
    }

    const r = detectDuplicateAnswerEvents(mockData)
    expect(isPlainObj(r)).toBeTrue()
    expect(r.Message).toBe('Duplicate answer event (1)')
  })

  it('reports on multiple DuplicateAnswerError events', () => {
    const mockData = {
      checkPayload: {
        audit: [
          {
            type: 'DuplicateAnswerError',
            data: {
              sequenceNumber: 1
            }
          },
          {
            type: 'DuplicateAnswerError',
            data: {
              sequenceNumber: 2
            }
          },
          {
            type: 'DuplicateAnswerError',
            data: {
              sequenceNumber: 3
            }
          }
        ]
      }
    }

    const r = detectDuplicateAnswerEvents(mockData)
    expect(isPlainObj(r)).toBeTrue()
    expect(r.Message).toBe('Duplicate answer event (3)')
    expect(r['Question number']).toBe('1, 2, 3')
  })

  it('does not report if there isn\'t a DuplicateAnswerError event', () => {
    const mockData = {
      checkPayload: {
        audit: [
          {
            type: 'x',
            data: {
              sequenceNumber: 1
            }
          }
        ]
      }
    }

    const r = detectDuplicateAnswerEvents(mockData)
    expect(r).toBeUndefined()
  })
})
