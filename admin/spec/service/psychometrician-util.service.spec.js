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

    it('returns an empty string if there was not a timeout', () => {
      const input = [...touchInput]
      input.push({
        'clientInputDate': '2017-10-17T18:20:44.999Z',
        'eventType': 'click',
        'input': 'Enter'
      })
      const res = service.getTimeoutWithNoResponseFlag(input)
      expect(res).toBe('')
    })

    it('returns 0 (timeout with no response) when there is a timeout without an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([], {answer: ''})
      expect(res).toBe(0)
    })

    it('returns 1 (timeout with a response) when there is a timeout with an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([{
        'clientInputDate': '2017-10-17T18:20:44.999Z',
        'eventType': 'click',
        'input': '1'
      }], {answer: '1'})
      expect(res).toBe(1)
    })

    it('returns 1 (timeout with no response) when there isnt any input and there is an answer', () => {
      // this would be a bug of some sort..., as any answer must have a corresponding input
      const res = service.getTimeoutWithNoResponseFlag([], {answer: '1'})
      expect(res).toBe(1)
    })
  })

  describe('#getTimeoutWithCorrectAnser', () => {
    it('returns an empty string if there was NOT a timeout', () => {
      const res = service.getTimeoutWithCorrectAnswer(keyboardInput, {isCorrect: true})
      expect(res).toBe('')
    })

    it('returns 1 if there was a timeout and the answer is correct', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, {isCorrect: true})
      expect(res).toBe(1)
    })

    it('returns 0 if there was a timeout and the answer is incorrect', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, {isCorrect: false})
      expect(res).toBe(0)
    })
  })

  describe('#getRecallTime', () => {
    const tLoad = '2018-02-16T20:04:49.339Z'
    const tFirstKey = '2018-02-16T20:04:50.180Z'

    it('returns the number of seconds between tLoad and tFirstKey', () => {
      const res = service.getRecallTime(tLoad, tFirstKey)
      expect(res).toBe(0.841)
    })

    it('returns an empty string if tLoad is empty', () => {
      const res = service.getRecallTime('', tFirstKey)
      expect(res).toBe('')
    })

    it('returns an empty string if tFirstKey is empty', () => {
      const res = service.getRecallTime(tLoad, '')
      expect(res).toBe('')
    })

    it('returns an empty string if tLoad is not a valid timestamp', () => {
      spyOn(console, 'warn') // prevent moment warning from appearing complaining about the input
      const res = service.getRecallTime('not-a-timestamp', tFirstKey)
      expect(res).toBe('')
    })

    it('returns an empty string if tFirstKey is not a valid timestamp', () => {
      spyOn(console, 'warn') // prevent moment warning from appearing complaining about the input
      const res = service.getRecallTime(tLoad, 'not-a-timestamp')
      expect(res).toBe('')
    })
  })

  describe('#getDevice', () => {
    // NB - UA strings are from `useragent`
    it('returns the device type for a MBP', () => {
      const device = service.getDevice('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6')
      expect(device).toBe('Other')
    })
    it('returns the device type for an 10.5 inch iPad Pro running iOS 11.2', () => {
      const device = service.getDevice('Mozilla/5.0 (iPad; CPU OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C107 Safari/604.1')
      expect(device).toBe('iPad')
    })
    it('returns the device type for an iPad Air running iOS 10.3.1', () => {
      const device = service.getDevice('Mozilla/5.0 (iPad; CPU OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E8301 Safari/602.1')
      expect(device).toBe('iPad')
    })
    it('returns the device type for an Nexus 7 running android', () => {
      const device = service.getDevice('Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Safari/537.36')
      expect(device).toBe('Asus Nexus 7')
    })
    it('returns an empty string if the useragent string is not provided', () => {
      const device = service.getDevice(null)
      expect(device).toBe('')
    })
  })

  describe('#getBrowser', () => {
    // NB - UA strings are from `useragent`
    it('returns the correct browser type for a MBP running Safari', () => {
      const browser = service.getBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6')
      expect(browser).toBe('Safari 11.0.3 / Mac OS X 10.13.3')
    })
    it('returns the correct browser type for FireFox 58 on OSX', () => {
      const browser = service.getBrowser('Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:58.0) Gecko/20100101 Firefox/58.0')
      expect(browser).toBe('Firefox 58.0.0 / Mac OS X 10.13.0')
    })
    it('returns the correct browser type for an 10.5 inch iPad Pro running iOS 11.2', () => {
      const browser = service.getBrowser('Mozilla/5.0 (iPad; CPU OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C107 Safari/604.1')
      expect(browser).toBe('Mobile Safari 11.0.0 / iOS 11.2.0')
    })
    it('returns the correct browser type for Edge on Window 10', () => {
      const browser = service.getBrowser('Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42..2311.135 Safari/537.36 Edge/12.10136')
      expect(browser).toBe('Edge 12.10136.0 / Windows 10.0.0')
    })
    it('returns the correct browser type for Chrome on Window 10', () => {
      const browser = service.getBrowser('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.119 Safari/537.36')
      expect(browser).toBe('Chrome 64.0.3282 / Windows 10.0.0')
    })
    it('returns an empty string if the uyseragent string is not provided', () => {
      const browser = service.getBrowser()
      expect(browser).toBe('')
    })
  })

  describe('#getInputMethod', () => {
    const mouseInput = [{eventType: 'mousedown'}]
    const keyInput = [{eventType: 'keydown'}]
    const touchInput = [{eventType: 'touchstart'}, {eventType: 'click'}]
    const mixedInput = [{eventType: 'keydown'}, {eventType: 'mousedown'}, {eventType: 'touch'}]
    it('returns "t" for touch input', () => {
      const inputMethod = service.getInputMethod(touchInput)
      expect(inputMethod).toBe('t')
    })

    it('returns "k" for key input', () => {
      const inputMethod = service.getInputMethod(keyInput)
      expect(inputMethod).toBe('k')
    })

    it('returns "m" for mouse input', () => {
      const inputMethod = service.getInputMethod(mouseInput)
      expect(inputMethod).toBe('m')
    })

    it('returns "" for no input', () => {
      const inputMethod = service.getInputMethod([])
      expect(inputMethod).toBe('')
    })

    it('returns "x" for mixed input', () => {
      const inputMethod = service.getInputMethod(mixedInput)
      expect(inputMethod).toBe('x')
    })
  })
})
