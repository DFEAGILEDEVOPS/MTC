'use strict'
/* global describe, it, expect, spyOn, beforeEach */

const sut = require('./v1.js')
const resultsService = require('./service/results.service')
const sqlService = require('../lib/sql/sql.service')
const mockContext = require('../mock-context')

describe('sync-results-to-sql:v1', () => {
  beforeEach(() => {
    spyOn(console, 'log') // trap line 33
    spyOn(resultsService, 'getQuestionData').and.returnValue({
      '2x5': { id: 1 },
      '3x3': { id: 3 }
    })
    spyOn(sqlService, 'modifyWithTransaction')
  })

  it('has an entry-point function', () => {
    expect(typeof sut.process).toBe('function')
  })

  it('calls the database to submit a single transaction', async () => {
    const mockCheckSubmissionMessage = {
      validatedCheck: {},
      markedCheck: {
        mark: 8,
        maxMark: 10,
        checkCode: 'abc-test',
        markedAt: '2020-09-23T11:57:19.154Z',
        markedAnswers: [
          {
            factor1: 2,
            factor2: 5,
            answer: '10',
            isCorrect: true,
            clientTimestamp: '2020-09-23T11:57:10.975Z',
            sequenceNumber: 1,
            question: '2x5'
          },
          {
            factor1: 3,
            factor2: 3,
            answer: '12',
            isCorrect: false,
            clientTimestamp: '2020-09-23T11:57:19.154Z',
            sequenceNumber: 2,
            question: '3x3'
          }
        ]
      }
    }
    await sut.process(mockContext, mockCheckSubmissionMessage)

    expect(sqlService.modifyWithTransaction).toHaveBeenCalledTimes(1)
  })
})
