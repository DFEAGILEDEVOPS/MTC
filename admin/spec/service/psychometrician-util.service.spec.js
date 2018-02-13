'use strict'
/* global describe it expect beforeEach spyOn */
const winston = require('winston')
const service = require('../../services/psychometrician-util.service')

// Get a marked check mock
const checkMockOrig = require('../mocks/check-with-results')

// and a completedCheck that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
const pupilMockOrig = require('../mocks/pupil')
const schoolMockOrig = require('../mocks/school')

const keyboardInput = require('../mocks/keyboard-input')
const touchInput = require('../mocks/touch-input')
const mouseInput = require('../mocks/mouse-input')

describe('psychometrician-util.service', () => {
  let completedCheckMock

  beforeEach(() => {
    completedCheckMock = Object.assign({ check: {} }, completedCheckMockOrig)
    const checkMock = Object.assign({}, checkMockOrig)
    const pupilMock = Object.assign({}, pupilMockOrig)
    const schoolMock = Object.assign({}, schoolMockOrig)
    completedCheckMock.check = checkMock
    pupilMock.school = schoolMock
    completedCheckMock.check.pupilId = pupilMock
  })

  describe('#getMark', () => {
    it('returns the number of mark applied to the check', () => {
      completedCheckMock.mark = 42
      expect(service.getMark(completedCheckMock)).toBe(42)
    })

    it('returns "error" if the check has not been marked', () => {
      completedCheckMock.mark = null
      expect(service.getMark(completedCheckMock)).toBe('error')
    })
  })

  describe('#getClientTimestamp from AuditEvent', () => {
    it('returns the clientTimestamp from an audit event', () => {
      const ts = service.getClientTimestampFromAuditEvent('CheckSubmissionPending', completedCheckMock)
      expect(ts).toBe('2018-02-11T15:43:26.772Z')
    })

    it('returns "error" if the clientTimestamp is missing', () => {
      completedCheckMock.data.audit.push({
        'type': 'CheckCompleteMissingTS'
      })
      const ts = service.getClientTimestampFromAuditEvent('CheckCompleteMissingTS', completedCheckMock)
      expect(ts).toBe('error')
    })

    it('returns "error" if there arent any logEntries', () => {
      completedCheckMock.data.audit = []
      const ts = service.getClientTimestampFromAuditEvent('AnyEvent', completedCheckMock)
      expect(ts).toBe('error')
    })
  })

  describe('#getUserInput', () => {
    beforeEach(() => {
      spyOn(winston, 'info')
    })

    it('returns a string showing all the user input for key events', () => {
      const ks1 = service.getUserInput(keyboardInput)
      expect(ks1).toBe('k[1], k[0], k[Enter]')
    })

    it('returns a string showing all the user input for mouse events', () => {
      const m = service.getUserInput(mouseInput)
      expect(m).toBe('m[2], m[5], m[backspace]')
    })

    it('returns a string showing all the user input for touch events', () => {
      const t = service.getUserInput(touchInput)
      expect(t).toBe('t[1], t[0]')
    })

    it('returns shows "U" for any unknown event types', () => {
      const input = [
        {
          eventType: 'FuturisticEvent',
          input: 'Y'
        }
      ]
      const t = service.getUserInput(input)
      expect(t).toBe('u[Y]')
    })
  })

  describe('#getLastAnswerInputTime', () => {
    it('returns "error" if not passed an array', () => {
      spyOn(winston, 'info')
      const res = service.getLastAnswerInputTime(null)
      expect(res).toBe('error')
    })

    it('returns empty string if there arent any inputs', () => {
      const res = service.getLastAnswerInputTime([])
      expect(res).toBe('')
    })

    it('returns the timestamp as a string from the last input', () => {
      const res = service.getLastAnswerInputTime(touchInput)
      expect(res).toBe('2017-10-09T09:50:07.708Z')
    })

    it('it ignores the last input if the last input is the user pressing enter on the virtual keypad', () => {
      const input = [...mouseInput]
      input.push({
        'clientInputDate': '2017-10-17T18:20:44.999Z',
        'eventType': 'click',
        'input': 'Enter'
      })
      const res = service.getLastAnswerInputTime(mouseInput)
      expect(res).toBe('2017-10-13T09:06:55.663Z')
    })
  })

  describe('#getFirstInputTime', () => {
    it('returns "error" if not passed an array', () => {
      spyOn(winston, 'info')
      const res = service.getLastAnswerInputTime(null)
      expect(res).toBe('error')
    })

    it('returns empty string if there arent any inputs', () => {
      const res = service.getLastAnswerInputTime([])
      expect(res).toBe('')
    })

    it('returns the first timestamp', () => {
      const res = service.getFirstInputTime(keyboardInput)
      expect(res).toBe('2017-10-17T18:20:44.447Z')
    })

    it('returns "error" if the log is unparseable', () => {
      const res = service.getFirstInputTime([{foo: 1, bar: 2, baz: 3}])
      expect(res).toBe('error')
    })
  })

  describe('#getResponseTime', () => {
    it('returns "error" if the arg is not an array', () => {
      spyOn(winston, 'info')
      const res = service.getResponseTime(999)
      expect(res).toBe('error')
    })

    it('returns "" if there isnt any input', () => {
      expect(service.getResponseTime([])).toBe('')
    })

    it('calculates the response time in seconds and thousandths of a second', () => {
      const res = service.getResponseTime(keyboardInput)
      expect(res).toBe(0.111)
    })
  })

  describe('#getTimeOutFlag', () => {
    it('throws an error if not passed an Array', () => {
      spyOn(winston, 'info')
      const res = service.getTimeoutFlag(null)
      expect(res).toBe('error')
    })

    it('returns 1 (indicating a timeout) when passed an empty array', () => {
      const res = service.getTimeoutFlag([])
      expect(res).toBe(1)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last keyboard entry', () => {
      const res = service.getTimeoutFlag(keyboardInput)
      expect(res).toBe(0)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last mouse-click entry', () => {
      const input = [...mouseInput]
      input.push({
        'clientInputDate': '2017-10-17T18:20:44.999Z',
        'eventType': 'click',
        'input': 'Enter'
      })
      const res = service.getTimeoutFlag(input)
      expect(res).toBe(0)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last touch-click entry', () => {
      const input = [...touchInput]
      input.push({
        'clientInputDate': '2017-10-17T18:20:44.999Z',
        'eventType': 'click',
        'input': 'Enter'
      })
      const res = service.getTimeoutFlag(input)
      expect(res).toBe(0)
    })
  })

  describe('#getTimeoutWithNoResponseFlag', () => {
    it('returns "error" when the arg isnt an array', () => {
      const res = service.getTimeoutWithNoResponseFlag(-1)
      expect(res).toBe('error')
    })

    it('returns 1 (timeout with no response) when there isnt any input and there isnt an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([], {answer: ''})
      expect(res).toBe(1)
    })

    it('returns 0 (timeout with no response) when there is input and there isnt an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([{
        'clientInputDate': '2017-10-13T09:06:53.692Z',
        'eventType': 'mousedown',
        'input': 'left click'
      }], {answer: ''})
      expect(res).toBe(0)
    })

    it('returns 0 (timeout with no response) when there isnt any input and there is an answer', () => {
      // this would be a bug of some sort..., as any answer must have a corresponding input
      const res = service.getTimeoutWithNoResponseFlag([], {answer: '1'})
      expect(res).toBe(0)
    })
  })

  describe('#getTimeoutWithCorrectAnser', () => {
    it('returns 1 if there was a timeout and the answer is correct', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, {isCorrect: true})
      expect(res).toBe(1)
    })

    it('returns 0 if there was NOT a timeout and the answer is correct', () => {
      const res = service.getTimeoutWithCorrectAnswer(keyboardInput, {isCorrect: true})
      expect(res).toBe(0)
    })

    it('returns 0 if there was a timeout and the answer is incorrect', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, {isCorrect: false})
      expect(res).toBe(0)
    })

    it('returns 0 if there was NOT a timeout and the answer is incorrect', () => {
      const res = service.getTimeoutWithCorrectAnswer(keyboardInput, {isCorrect: false})
      expect(res).toBe(0)
    })
  })
})
