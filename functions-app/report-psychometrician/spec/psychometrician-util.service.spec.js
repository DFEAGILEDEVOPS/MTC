'use strict'
/* global describe, it, expect, beforeEach, spyOn, fail */
const R = require('ramda')
const service = require('../service/psychometrician-util.service')
const moment = require('moment')

// Get a marked check mock
const checkMockOrig = require('./mocks/check-with-results')

// and a completedCheck that has been marked
const completedCheckMockOrig = require('./mocks/completed-check-with-results')
const pupilMockOrig = require('./mocks/pupil')
const schoolMockOrig = require('./mocks/school')

const keyboardInput = require('./mocks/keyboard-input')
const touchInput = require('./mocks/touch-input')
const mouseInput = require('./mocks/mouse-input')
const keyboardInput2 = require('./mocks/keyboard-input-2')
const keyboardInput3 = require('./mocks/keyboard-input-3')
const keyboardInput4 = require('./mocks/keyboard-input-4')
const keyboardInput5 = require('./mocks/keyboard-input-5')

describe('psychometrician-util.service', () => {
  let completedCheckMock

  beforeEach(() => {
    completedCheckMock = R.clone(completedCheckMockOrig)
    const checkMock = R.clone(checkMockOrig)
    const pupilMock = R.clone(pupilMockOrig)
    const schoolMock = R.clone(schoolMockOrig)
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

  describe('#getClientTimestampDiffFromAuditEvents  calculates the difference from two AuditEvents', () => {
    it('returns empty string if the check is not completed', () => {
      const completedCheck = Object.assign({}, completedCheckMock)
      completedCheck.data = undefined
      const ts = service.getClientTimestampDiffFromAuditEvents('CheckStarted', 'CheckSubmissionPending', completedCheck)
      expect(ts).toBe('')
    })
    it('returns the difference between two AuditEvents timestamps', () => {
      const completedCheck = Object.assign({}, completedCheckMock)
      const ts = service.getClientTimestampDiffFromAuditEvents('CheckStarted', 'CheckSubmissionPending', completedCheck)
      expect(ts).toBe('00:00:48')
    })
  })

  describe('#getClientTimestamp from AuditEvent', () => {
    it('returns the clientTimestamp from an audit event', () => {
      const ts = service.getClientTimestampFromAuditEvent('CheckSubmissionPending', completedCheckMock)
      expect(ts).toBe('2018-02-11T15:43:26.772Z')
    })

    it('returns empty string if the check is not completed', () => {
      completedCheckMock.data = undefined
      const ts = service.getClientTimestampFromAuditEvent('CheckCompleteMissingTS', completedCheckMock)
      expect(ts).toBe('')
    })

    it('returns "error" if the clientTimestamp is missing', () => {
      completedCheckMock.data.audit.push({
        type: 'CheckCompleteMissingTS'
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

  describe('#cleanupInputEvents', () => {
    describe('simple', () => {
      const simpleTouch = [
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:53:45.981Z',
          question: 1
        },
        {
          input: '8',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:53:46.068Z',
          question: 1
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:53:47.981Z',
          question: 1
        },
        {
          input: '9',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:53:47.068Z',
          question: 1
        }
      ]

      const simpleMouse = [
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-02-26T09:40:04.264Z',
          question: 1
        },
        {
          input: '8',
          eventType: 'click',
          clientTimestamp: '2018-02-26T09:40:04.399Z',
          question: 1
        }
      ]

      const simpleKey = [
        {
          input: '1',
          eventType: 'keydown',
          clientTimestamp: '2018-02-26T09:41:03.686Z',
          question: 11
        }
      ]

      describe('touch events', () => {
        it('filters the touchstart and click events into a single object', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output.length).toBe(2)
        })
        it('puts the events in the right order', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output[0].input).toBe('8')
          expect(output[1].input).toBe('9')
        })
        it('uses the timestamp of the touchstart event', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output[0].clientTimestamp).toBe('2018-03-07T10:53:45.981Z')
        })
        it('sets the event type to "touch"', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output[0].eventType).toBe('touch')
        })
        it('sets the input correctly', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output[0].input).toBe('8')
        })
        it('sets the question correctly', () => {
          const output = service.cleanUpInputEvents(simpleTouch)
          expect(output[0].question).toBe(1)
        })
      })

      describe('mouse events', () => {
        it('filters the mousedown and click events into a single object', () => {
          const output = service.cleanUpInputEvents(simpleMouse)
          expect(output.length).toBe(1)
        })
        it('uses the timestamp of the mousedown event', () => {
          const output = service.cleanUpInputEvents(simpleMouse)
          expect(output[0].clientTimestamp).toBe('2018-02-26T09:40:04.264Z')
        })
        it('sets the event type to "click"', () => {
          const output = service.cleanUpInputEvents(simpleMouse)
          expect(output[0].eventType).toBe('click')
        })
        it('sets the input correctly', () => {
          const output = service.cleanUpInputEvents(simpleMouse)
          expect(output[0].input).toBe('8')
        })
        it('sets the question correctly', () => {
          const output = service.cleanUpInputEvents(simpleMouse)
          expect(output[0].question).toBe(1)
        })
      })

      describe('key events', () => {
        it('does not filter the events', () => {
          const output = service.cleanUpInputEvents(simpleKey)
          expect(output.length).toBe(1)
        })
        it('has an event type of "keydown"', () => {
          const output = service.cleanUpInputEvents(simpleKey)
          expect(output[0].eventType).toBe('keydown')
        })
        it('has the input correct', () => {
          const output = service.cleanUpInputEvents(simpleKey)
          expect(output[0].input).toBe('1')
        })
        it('has the question correct', () => {
          const output = service.cleanUpInputEvents(simpleKey)
          expect(output[0].question).toBe(11)
        })
        it('has the date and time correct', () => {
          const output = service.cleanUpInputEvents(simpleKey)
          expect(output[0].clientTimestamp).toBe('2018-02-26T09:41:03.686Z')
        })
      })
    })

    describe('complex', () => {
      const touchInput = [
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:53:51.697Z',
          question: 2
        },
        {
          input: '1',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:53:51.767Z',
          question: 2
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:53:52.138Z',
          question: 2
        },
        {
          input: '5',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:53:52.216Z',
          question: 2
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:53:52.486Z',
          question: 2
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:53:52.583Z',
          question: 2
        }
      ]
      const mouseInput = [
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-03-05T14:05:30.563Z',
          question: 2
        },
        {
          input: '1',
          eventType: 'click',
          clientTimestamp: '2018-03-05T14:05:30.787Z',
          question: 2
        },
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-03-05T14:05:31.565Z',
          question: 2
        },
        {
          input: '5',
          eventType: 'click',
          clientTimestamp: '2018-03-05T14:05:31.733Z',
          question: 2
        },
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-03-05T14:05:32.377Z',
          question: 2
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-03-05T14:05:32.519Z',
          question: 2
        }
      ]

      describe('touch', () => {
        it('filters out touchstart events', () => {
          const output = service.cleanUpInputEvents(touchInput)
          expect(output.length).toBe(3)
        })
        it('consolidates the inputs correctly', () => {
          const output = service.cleanUpInputEvents(touchInput)
          output.forEach(input => {
            expect(input.eventType).toBe('touch')
          })
          expect(output[0].input).toBe('1')
          expect(output[1].input).toBe('5')
          expect(output[2].input).toBe('enter')
        })
      })

      describe('mouse', () => {
        it('filters out all mousedown events', () => {
          const output = service.cleanUpInputEvents(mouseInput)
          expect(output.length).toBe(3)
        })
        it('consolidates the inputs correctly', () => {
          const output = service.cleanUpInputEvents(mouseInput)
          output.forEach(input => {
            expect(input.eventType).toBe('click')
          })
          expect(output[0].input).toBe('1')
          expect(output[1].input).toBe('5')
          expect(output[2].input).toBe('enter')
        })
      })
    })

    describe('hard', () => {
      // This shows lots of touch events, but not all of them have corresponding inputs
      const touchInput1 = [
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.715Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.716Z',
          question: 12
        },
        {
          input: '2',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:42.722Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.831Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.845Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.884Z',
          question: 12
        },
        {
          input: '6',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:42.915Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:43.014Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:43.056Z',
          question: 12
        },
        {
          input: '3',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:43.084Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:43.147Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:43.263Z',
          question: 12
        },
        {
          input: '2',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:43.277Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:43.691Z',
          question: 12
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:43.747Z',
          question: 12
        }
      ]

      const missingTouchHeader = [
        {
          input: '1',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:42.702Z',
          question: 12
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-01T09:45:42.716Z',
          question: 12
        },
        {
          input: '2',
          eventType: 'click',
          clientTimestamp: '2018-03-01T09:45:42.722Z',
          question: 12
        }
      ]

      it('filters orphaned touchstart events providing the correct timestamps', () => {
        const output = service.cleanUpInputEvents(touchInput1)
        expect(output.length).toBe(5)
        expect(output[0].input).toBe('2')
        expect(output[0].clientTimestamp).toBe('2018-03-01T09:45:42.716Z')
        expect(output[1].input).toBe('6')
        expect(output[1].clientTimestamp).toBe('2018-03-01T09:45:42.884Z')
        expect(output[2].input).toBe('3')
        expect(output[2].clientTimestamp).toBe('2018-03-01T09:45:43.056Z')
        expect(output[3].input).toBe('2')
        expect(output[3].clientTimestamp).toBe('2018-03-01T09:45:43.263Z')
        expect(output[4].input).toBe('enter')
        expect(output[4].clientTimestamp).toBe('2018-03-01T09:45:43.691Z')
      })

      it('handles missing touch headers gracefully', () => {
        const output = service.cleanUpInputEvents(missingTouchHeader)
        expect(output.length).toBe(2)
        expect(output[0].input).toBe('1')
        expect(output[0].clientTimestamp).toBe('2018-03-01T09:45:42.702Z')
        expect(output[0].eventType).toBe('touch')
        expect(output[1].input).toBe('2')
        expect(output[1].clientTimestamp).toBe('2018-03-01T09:45:42.716Z')
        expect(output[1].eventType).toBe('touch')
      })
    })

    describe('mixed', () => {
      const mixedMouseAndKey = [
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-02-26T13:53:19.711Z',
          question: 2
        },
        {
          input: '1',
          eventType: 'click',
          clientTimestamp: '2018-02-26T13:53:22.739Z',
          question: 2
        },
        {
          input: '5',
          eventType: 'keydown',
          clientTimestamp: '2018-02-26T13:53:23.404Z',
          question: 2
        }
      ]
      const mixedTouchAndMouse = [
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-03-07T10:52:41.981Z',
          question: 1
        },
        {
          input: '8',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:52:41.983Z',
          question: 1
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:52:45.981Z',
          question: 1
        },
        {
          input: '9',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:52:46.068Z',
          question: 1
        }
      ]

      const mixedTriple = [
        {
          input: '5',
          eventType: 'keydown',
          clientTimestamp: '2018-03-07T10:52:40.981Z',
          question: 2
        },
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-03-07T10:52:41.981Z',
          question: 1
        },
        {
          input: '8',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:52:41.983Z',
          question: 1
        },
        {
          input: '',
          eventType: 'touchstart',
          clientTimestamp: '2018-03-07T10:52:45.981Z',
          question: 1
        },
        {
          input: '9',
          eventType: 'click',
          clientTimestamp: '2018-03-07T10:52:46.068Z',
          question: 1
        },
        {
          input: '5',
          eventType: 'keydown',
          clientTimestamp: '2018-03-07T10:52:47.951Z',
          question: 2
        }
      ]

      it('handles mixed mouse and key input', () => {
        const output = service.cleanUpInputEvents(mixedMouseAndKey)
        expect(output.length).toBe(2)
        expect(output[0].input).toBe('1')
        expect(output[0].eventType).toBe('click')
        expect(output[0].clientTimestamp).toBe('2018-02-26T13:53:19.711Z')
        expect(output[1].input).toBe('5')
        expect(output[1].eventType).toBe('keydown')
        expect(output[1].clientTimestamp).toBe('2018-02-26T13:53:23.404Z')
      })

      it('handles mixed touch and mouse input', () => {
        const output = service.cleanUpInputEvents(mixedTouchAndMouse)
        expect(output.length).toBe(2)
        expect(output[0].input).toBe('8')
        expect(output[0].eventType).toBe('click')
        expect(output[0].clientTimestamp).toBe('2018-03-07T10:52:41.981Z')
        expect(output[1].input).toBe('9')
        expect(output[1].eventType).toBe('touch')
        expect(output[1].clientTimestamp).toBe('2018-03-07T10:52:45.981Z')
      })

      it('handles mixed touch and mouse and key input', () => {
        const output = service.cleanUpInputEvents(mixedTriple)
        expect(output.length).toBe(4)
        expect(output[0].input).toBe('5')
        expect(output[0].eventType).toBe('keydown')
        expect(output[0].clientTimestamp).toBe('2018-03-07T10:52:40.981Z')
        expect(output[1].input).toBe('8')
        expect(output[1].eventType).toBe('click')
        expect(output[1].clientTimestamp).toBe('2018-03-07T10:52:41.981Z')
        expect(output[2].input).toBe('9')
        expect(output[2].eventType).toBe('touch')
        expect(output[2].clientTimestamp).toBe('2018-03-07T10:52:45.981Z')
        expect(output[3].input).toBe('5')
        expect(output[3].eventType).toBe('keydown')
        expect(output[3].clientTimestamp).toBe('2018-03-07T10:52:47.951Z')
      })
    })

    describe('prod-issue-1 : unbalanced clicks and header events', () => {
      const input = [
        {
          input: 'left click',
          eventType: 'mousedown',
          clientTimestamp: '2018-06-28T08:51:15.591Z',
          question: '4x9',
          sequenceNumber: 17
        },
        {
          input: '2',
          eventType: 'click',
          clientTimestamp: '2018-06-28T08:51:15.683Z',
          question: '4x9',
          sequenceNumber: 17
        },
        {
          input: '5',
          eventType: 'click',
          clientTimestamp: '2018-06-28T08:51:15.688Z',
          question: '4x9',
          sequenceNumber: 17
        }
      ]

      it('returns without error', () => {
        try {
          const output = service.cleanUpInputEvents(input)
          expect(output).toBeTruthy()
          expect(output.length).toBe(2)
          // In the output above you might assume that the first click would get the timestamp
          // of the first header, but that would mean that there would only be 5ms for the user to click
          // the second button - unlikely?
          // In this case we have clearly lost input (one of the headers) so we end up in a crazy situation
          // where the second click has a timestamp earlier than the first click.
          expect(output[0].clientTimestamp).toBe('2018-06-28T08:51:15.683Z')
          // Expect the 2nd click to have the altered timestamp
          expect(output[1].clientTimestamp).toBe('2018-06-28T08:51:15.591Z')
        } catch (error) {
          fail(error)
        }
      })
    })
  })

  describe('#getUserInput', () => {
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

    it('unknown event types get discarded', () => {
      const input = [
        {
          eventType: 'FuturisticEvent',
          input: 'Y'
        }
      ]
      const t = service.getUserInput(input)
      expect(t).toBe('')
    })
  })

  describe('#getLastAnswerInputTime', () => {
    it('returns "error" if not passed an array', () => {
      const res = service.getLastAnswerInputTime(null, '')
      expect(res).toBe('error')
    })

    it('returns empty string if there arent any inputs', () => {
      const res = service.getLastAnswerInputTime([], '')
      expect(res).toBe('')
    })

    it('returns the timestamp as a string from the last input', () => {
      const res = service.getLastAnswerInputTime(touchInput, '10')
      expect(res).toBe('2017-10-09T09:50:07.099Z')
    })

    it('it ignores the last input if the last input is the user pressing enter on the virtual keypad', () => {
      const input = [...mouseInput]
      input.push({
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: 'Enter'
      })
      const res = service.getLastAnswerInputTime(input, '2')
      expect(res).toBe('2017-10-13T09:06:55.234Z')
    })

    it('handles inputs such as all enter key presses', () => {
      const allEnterKeys = [
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.564Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.565Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.566Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.567Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.564Z',
          question: 16
        }
      ]
      const res = service.getLastAnswerInputTime(allEnterKeys, '')
      expect(res).toBe('') // enter key does not count
    })

    it('reports Backspace events if they modify the input', () => {
      const res = service.getLastAnswerInputTime(keyboardInput4, '1')
      expect(res).toBe('2017-10-17T18:20:44.670Z')
    })

    it('ignores backspace events if there isnt any input', () => {
      const res = service.getLastAnswerInputTime(keyboardInput5, '')
      expect(res).toBe('')
    })
  })

  describe('#getFirstInputTime', () => {
    it('returns "error" if not passed an array', () => {
      const res = service.getLastAnswerInputTime(null)
      expect(res).toBe('error')
    })

    it('returns empty string if there arent any inputs', () => {
      const res = service.getLastAnswerInputTime([], '')
      expect(res).toBe('')
    })

    it('returns the first timestamp that affects the answer box', () => {
      const res = service.getFirstInputTime(keyboardInput2, '10')
      expect(res).toBe('2017-10-17T18:20:44.447Z')
    })

    it('returns the timestamp from the first mouse input', () => {
      const res = service.getFirstInputTime(mouseInput, '2')
      expect(res).toBe('2017-10-13T09:06:53.692Z')
    })

    it('handles inputs such as all enter key presses', () => {
      const allEnterKeys = [
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.564Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.565Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.566Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.567Z',
          question: 16
        },
        {
          input: 'enter',
          eventType: 'click',
          clientTimestamp: '2018-02-28T11:44:08.564Z',
          question: 16
        }
      ]
      const res = service.getFirstInputTime(allEnterKeys, '')
      expect(res).toBe('') // enter key does not count
    })

    it('ignores backspaces that occur before any real input', () => {
      const res = service.getFirstInputTime(keyboardInput3, '10')
      expect(res).toBe('2017-10-17T18:20:44.447Z')
    })
  })

  describe('#getResponseTime', () => {
    it('returns "error" if the arg is not an array', () => {
      const res = service.getResponseTime(999)
      expect(res).toBe('error')
    })

    it('returns "" if there isnt any input', () => {
      expect(service.getResponseTime([])).toBe('')
    })

    it('calculates the response time in seconds and thousandths of a second', () => {
      const res = service.getResponseTime(keyboardInput, '11')
      expect(res).toBe(0.111)
    })
  })

  describe('#getTimeOutFlag', () => {
    it('throws an error if not passed an Array', () => {
      const res = service.getTimeoutFlag('', null)
      expect(res).toBe('error')
    })

    it('returns 1 (indicating a timeout) when passed an empty array', () => {
      const res = service.getTimeoutFlag('', [])
      expect(res).toBe(1)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last keyboard entry', () => {
      const res = service.getTimeoutFlag('10', keyboardInput)
      expect(res).toBe(0)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last mouse-click entry', () => {
      const input = [...mouseInput]
      input.push({
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: 'Enter'
      })
      const res = service.getTimeoutFlag('25', input)
      expect(res).toBe(0)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last touch-click entry', () => {
      const input = [...touchInput]
      input.push({
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: 'Enter'
      })
      const res = service.getTimeoutFlag('10', input)
      expect(res).toBe(0)
    })

    it('returns 0 (indicating NO timeout) when passed an array with Enter as the last touch-click entry, but with trailing input', () => {
      const input = [...touchInput]
      input.push({
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: 'Enter'
      })
      input.push({
        clientTimestamp: '2017-10-17T18:20:45.001Z',
        eventType: 'touchstart',
        input: ''
      })
      const res = service.getTimeoutFlag('10', input)
      expect(res).toBe(0)
    })

    it('returns 1 - indicating a timeout - if the only input is the Enter key', () => {
      const input = [{
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.558Z',
        eventType: 'keydown',
        input: '0'
      },
      {
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.678Z',
        eventType: 'keydown',
        input: 'Enter'
      }]
      const res = service.getTimeoutFlag('', input)
      expect(res).toBe(1)
    })

    it('returns 1 - indicating a timeout - if the only input is non-numeric', () => {
      const input = [{
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.558Z',
        eventType: 'keydown',
        input: '0'
      },
      {
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.678Z',
        eventType: 'keydown',
        input: 'a'
      },
      {
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.558Z',
        eventType: 'keydown',
        input: '0'
      },
      {
        question: 1,
        clientTimestamp: '2017-10-17T18:20:44.678Z',
        eventType: 'keydown',
        input: 'a'
      }]
      const res = service.getTimeoutFlag('', input)
      expect(res).toBe(1)
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
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: 'Enter'
      })
      const markedAnswerMock = { answer: '10' }
      const res = service.getTimeoutWithNoResponseFlag(input, markedAnswerMock)
      expect(res).toBe('')
    })

    it('returns 0 (timeout with no response) when there is a timeout without an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([], { answer: '' })
      expect(res).toBe(0)
    })

    it('returns 1 (timeout with a response) when there is a timeout with an answer', () => {
      const res = service.getTimeoutWithNoResponseFlag([{
        clientTimestamp: '2017-10-17T18:20:44.999Z',
        eventType: 'click',
        input: '1'
      }], { answer: '1' })
      expect(res).toBe(1)
    })

    it('returns 1 (timeout with no response) when there isnt any input and there is an answer', () => {
      // this would be a bug of some sort..., as any answer must have a corresponding input
      const res = service.getTimeoutWithNoResponseFlag([], { answer: '1' })
      expect(res).toBe(1)
    })
  })

  describe('#getTimeoutWithCorrectAnswer', () => {
    it('returns an empty string if there was NOT a timeout', () => {
      const res = service.getTimeoutWithCorrectAnswer(keyboardInput, { isCorrect: true, answer: '10' })
      expect(res).toBe('')
    })

    it('returns 1 if there was a timeout and the answer is correct', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, { isCorrect: true, answer: '2' })
      expect(res).toBe(1)
    })

    it('returns 0 if there was a timeout and the answer is incorrect', () => {
      const res = service.getTimeoutWithCorrectAnswer(mouseInput, { isCorrect: false, answer: '2' })
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

  describe('#getDeviceTypeAndModel', () => {
    // NB - UA strings are from `useragent`
    it('returns the device type for a MBP', () => {
      const device = service.getDeviceTypeAndModel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6')
      expect(device).toEqual({ type: 'desktop', model: 'Other' })
    })
    it('returns the device type for an 10.5 inch iPad Pro running iOS 11.2', () => {
      const device = service.getDeviceTypeAndModel('Mozilla/5.0 (iPad; CPU OS 11_2 like Mac OS X) AppleWebKit/604.4.7 (KHTML, like Gecko) Version/11.0 Mobile/15C107 Safari/604.1')
      expect(device).toEqual({ type: 'tablet', model: 'iPad' })
    })
    it('returns the device type for an iPad Air running iOS 10.3.1', () => {
      const device = service.getDeviceTypeAndModel('Mozilla/5.0 (iPad; CPU OS 10_3_1 like Mac OS X) AppleWebKit/603.1.30 (KHTML, like Gecko) Version/10.0 Mobile/14E8301 Safari/602.1')
      expect(device).toEqual({ type: 'tablet', model: 'iPad' })
    })
    it('returns the device type for an Nexus 7 running android', () => {
      const device = service.getDeviceTypeAndModel('Mozilla/5.0 (Linux; Android 6.0.1; Nexus 7 Build/MOB30D) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.83 Safari/537.36')
      expect(device).toEqual({ type: 'tablet', model: 'Asus Nexus 7' })
    })
    it('returns an empty string if the useragent string is not provided', () => {
      const device = service.getDeviceTypeAndModel(null)
      expect(device).toEqual({ type: '', model: '' })
    })
  })

  describe('#getDeviceId', () => {
    it('returns the device type for complete device options', () => {
      const deviceId = service.getDeviceId({
        cpu: { hardwareConcurrency: 4 },
        navigator: {
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_3) AppleWebKit/604.5.6 (KHTML, like Gecko) Version/11.0.3 Safari/604.5.6',
          platform: 'x86',
          language: 'en-GB',
          cookieEnabled: true,
          doNotTrack: false
        }
      })
      expect(deviceId).toBe('218fa19a14790e4be6144717543907bc547fe86f')
    })

    it('ignores non-changing device options', () => {
      const deviceId = service.getDeviceId({
        cpu: 1,
        navigator: 2
      })

      const deviceId2 = service.getDeviceId({
        cpu: 1,
        navigator: 2,
        screen: 3
      })
      expect(deviceId).toBe(deviceId2)
    })

    it('returns an empty string if there are no non-changing device options', () => {
      const deviceId = service.getDeviceId(undefined)
      expect(deviceId).toBe('')

      const deviceId2 = service.getDeviceId({ screen: 1 })
      expect(deviceId2).toBe('')
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
    const mouseInput = [{ eventType: 'mousedown' }, { eventType: 'click' }]
    const keyInput = [{ eventType: 'keydown' }]
    const touchInput = [{ eventType: 'touchstart' }, { eventType: 'click' }]
    const mixedInput = [
      { eventType: 'keydown' },
      { eventType: 'mousedown' },
      { eventType: 'click' },
      { eventType: 'touchstart' },
      { eventType: 'click' }
    ]

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

  describe('#getPupilStatus', () => {
    it('returns "Incomplete" when attendanceCode is set', () => {
      const status = service.getPupilStatus('LEFTT', '')
      expect(status).toBe('Not taking the check')
    })
    it('returns "Incomplete" when code is NTR', () => {
      const status = service.getPupilStatus('', 'NTR')
      expect(status).toBe('Incomplete')
    })
    it('returns "Completed" when no attendanceCode or NTR', () => {
      const status = service.getPupilStatus('', 'CMP')
      expect(status).toBe('Completed')
    })
  })

  describe('#getAccessArrangements', () => {
    it('returns "" when config is emtpy', () => {
      const aa = service.getAccessArrangements(null)
      expect(aa).toBe('')
    })
    it('returns "[1]" for audbile sounds', () => {
      const aa = service.getAccessArrangements({ audibleSounds: true })
      expect(aa).toBe('[1]')
    })
    it('returns "[2]" for question reader', () => {
      const aa = service.getAccessArrangements({ questionReader: true })
      expect(aa).toBe('[2]')
    })
    it('returns "[3]" for colour contrast', () => {
      const aa = service.getAccessArrangements({ colourContrast: true })
      expect(aa).toBe('[3]')
    })
    it('returns "[4]" for input assistance', () => {
      const aa = service.getAccessArrangements({ inputAssistance: true })
      expect(aa).toBe('[4]')
    })
    it('returns "[5]" for next font size', () => {
      const aa = service.getAccessArrangements({ fontSize: true })
      expect(aa).toBe('[5]')
    })
    it('returns "[6]" for next between questions', () => {
      const aa = service.getAccessArrangements({ nextBetweenQuestions: true })
      expect(aa).toBe('[6]')
    })
    it('returns "[7]" for numpad removal', () => {
      const aa = service.getAccessArrangements({ numpadRemoval: true })
      expect(aa).toBe('[7]')
    })
    it('returns multiple access arrangement codes', () => {
      const aa = service.getAccessArrangements({
        questionReader: true,
        inputAssistance: true,
        numpadRemoval: true
      })
      expect(aa).toBe('[2][4][7]')
    })
  })

  describe('#getReaderStartTime', () => {
    it('returns "" if audit data not found', () => {
      const time = service.getReaderStartTime(1, {})
      expect(time).toBe('')
    })
    it('returns QuestionReadingStarted', () => {
      const audits = [
        {
          type: 'QuestionReadingStarted',
          clientTimestamp: '2019-02-14T08:59:52.905Z',
          data: { sequenceNumber: 3 }
        }
      ]
      const time = service.getReaderStartTime(3, audits)
      expect(time).toBe('2019-02-14T08:59:52.905Z')
      const notime = service.getReaderStartTime(2, audits)
      expect(notime).toBe('')
    })
  })

  describe('#getReaderEndTime', () => {
    it('returns "" if audit data not found', () => {
      const time = service.getReaderEndTime(1, {})
      expect(time).toBe('')
    })
    it('returns QuestionReadingEnded', () => {
      const audits = [
        {
          type: 'QuestionReadingEnded',
          clientTimestamp: '2019-02-14T08:59:54.110Z',
          data: { sequenceNumber: 3 }
        }
      ]
      const time = service.getReaderEndTime(3, audits)
      expect(time).toBe('2019-02-14T08:59:54.110Z')
      const notime = service.getReaderEndTime(2, audits)
      expect(notime).toBe('')
    })
  })

  describe('#getRestartReasonNumber', () => {
    it('returns 1 for LOI', () => {
      const n = service.getRestartReasonNumber('LOI')
      expect(n).toBe(1)
    })
    it('returns 2 for ITI', () => {
      const n = service.getRestartReasonNumber('ITI')
      expect(n).toBe(2)
    })
    it('returns 3 for CLD', () => {
      const n = service.getRestartReasonNumber('CLD')
      expect(n).toBe(3)
    })
    it('returns 4 for DNC', () => {
      const n = service.getRestartReasonNumber('DNC')
      expect(n).toBe(4)
    })
    it('returns "" for an unknown code', () => {
      const n = service.getRestartReasonNumber('XX')
      expect(n).toBe('')
    })
  })

  describe('#getAttendanceReasonNumber', () => {
    it('returns 1 for INCRG', () => {
      const n = service.getAttendanceReasonNumber('INCRG')
      expect(n).toBe(1)
    })
    it('returns 2 for ABSNT', () => {
      const n = service.getAttendanceReasonNumber('ABSNT')
      expect(n).toBe(2)
    })
    it('returns 3 for LEFTT', () => {
      const n = service.getAttendanceReasonNumber('LEFTT')
      expect(n).toBe(3)
    })
    it('returns 4 for NOACC', () => {
      const n = service.getAttendanceReasonNumber('NOACC')
      expect(n).toBe(4)
    })
    it('returns 5 for BLSTD', () => {
      const n = service.getAttendanceReasonNumber('BLSTD')
      expect(n).toBe(5)
    })
    it('returns 6 for JSTAR', () => {
      const n = service.getAttendanceReasonNumber('JSTAR')
      expect(n).toBe(6)
    })
    it('returns "" for an unknown code', () => {
      const n = service.getAttendanceReasonNumber('XX')
      expect(n).toBe('')
    })
  })

  describe('#getTimeDiff', () => {
    it('detects when tStart is null', () => {
      const res = service.getTimeDiff(null, moment())
      expect(res).toBe('')
    })

    it('detects when tStart is a empty string', () => {
      const res = service.getTimeDiff('', moment())
      expect(res).toBe('')
    })

    it('detects when tStart is undefined', () => {
      const res = service.getTimeDiff(undefined, moment())
      expect(res).toBe('')
    })

    it('detects when tStart is an invalid moment date', () => {
      const t1 = moment('2019-02-30T11:59:59')
      const res = service.getTimeDiff(t1, moment())
      expect(res).toBe('')
    })

    it('detects when tStart is null', () => {
      const res = service.getTimeDiff(moment, null)
      expect(res).toBe('')
    })

    it('detects when tStart is a empty string', () => {
      const res = service.getTimeDiff(moment(), '')
      expect(res).toBe('')
    })

    it('detects when tEnd is undefined', () => {
      const res = service.getTimeDiff(moment(), undefined)
      expect(res).toBe('')
    })

    it('detects when tEnd is an invalid moment date', () => {
      const t2 = moment('2019-02-30T11:59:59')
      const res = service.getTimeDiff(moment(), t2)
      expect(res).toBe('')
    })

    it('returns the duration correctly', () => {
      const t1 = moment('2019-08-29T16:55:30')
      const t2 = moment('2019-08-29T16:57:35')
      const res = service.getTimeDiff(t1, t2)
      expect(res).toBe('00:02:05')
    })
  })
})
