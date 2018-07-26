/* global describe it expect spyOn */

const func = require('./index')
const R = require('ramda')

describe('prepare-check function', () => {
  describe('validates the incoming message', () => {
    const validMessage = {
      schoolPin: 'abc12345',
      pupilPin: '1234',
      questions: [
        {
          order: 1,
          factor1: 1,
          factor2: 2
        },
        {
          order: 2,
          factor1: 1,
          factor2: 3
        }
      ],
      pupil: {
        firstName: 'Pupil',
        lastName: 'McPupil',
        dob: '1 January 2012',
        checkCode: '409F9494-25E5-4699-A109-1D81C783031B'
      },
      school: {
        id: 1,
        name: 'Test School'
      },
      config: {
        questionTime: 6,
        loadingTime: 3,
        speechSynthesis: false
      },
      sasToken: '0f824632-8fab-49c6-a5ac-818b485fff96',
      jwtToken: 'someToken'
    }

    const logFunc = function (level = 'INFO') { /* console.log(`[${level.toUpperCase()}]: `, ...R.tail(Array.from(arguments))) */ }

    const context = {
      bindings: {},
      log: (function () {
        const logHandler = R.partial(logFunc, ['info'])
        logHandler.verbose = R.partial(logFunc, ['verbose'])
        logHandler.info = R.partial(logFunc, ['info'])
        logHandler.error = R.partial(logFunc, ['error'])
        return logHandler
      }()), // whoo-hoo: a function with properties.  Your enthusiasm may vary.
      done: function () {}
    }

    it('validates a valid message', () => {
      spyOn(context, 'done')
      func(context, validMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args.length).toBe(0) // we expect done() to have been called without args.  args is an array.
    })

    it('rejects a message that is missing a schoolPin', () => {
      const mockMessage = R.omit(['schoolPin'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: schoolPin')
    })

    it('rejects a message that is missing a pupilPin', () => {
      const mockMessage = R.omit(['pupilPin'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: pupilPin')
    })

    it('rejects a message that is missing a pupil', () => {
      const mockMessage = R.omit(['pupil'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: pupil')
    })

    it('rejects a message that is missing a school', () => {
      const mockMessage = R.omit(['school'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: school')
    })

    it('rejects a message that is missing a sasToken', () => {
      const mockMessage = R.omit(['sasToken'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: sasToken')
    })

    it('rejects a message that is missing a jwtToken', () => {
      const mockMessage = R.omit(['jwtToken'], validMessage)
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Message failed validation check: missing field: jwtToken')
    })

    it('rejects a message when the pupil property is not an object', () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.pupil = 'Pupil Name Instead Of Object'
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('pupil is not an object')
    })

    it('rejects a message that is missing a pupil.firstName field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.firstName
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing pupil field: firstName')
    })

    it('rejects a message that is missing a pupil.lastName field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.lastName
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing pupil field: lastName')
    })

    it('rejects a message that is missing a pupil.dob field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.dob
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing pupil field: dob')
    })

    it('rejects a message that is missing a set of questions', () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.questions = 'a string instead of an array'
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Questions is not an Array')
    })

    it('rejects a message that is entirely composed of questions objects', () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.questions = [
        { order: 1, factor1: 1, factor2: 1 },
        { order: 2, factor1: 1, factor2: 2 },
        { invalid: 'object' }
      ]
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Invalid question')
    })

    it('rejects a message when the school property is not an object', () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.school = 'School of many pupils'
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('school is not an object')
    })

    it('rejects a message that is missing the school.id field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.school.id
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing school field: id')
    })

    it('rejects a message that is missing the school.name field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.school.name
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing school field: name')
    })

    it('rejects a message when the config property is not an object', () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.config = 'erroneous config string'
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('config is not an object')
    })

    it('rejects a message that is missing the config.questionTime field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.questionTime
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing config field: questionTime')
    })

    it('rejects a message that is missing the config.loadingTime field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.loadingTime
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing config field: loadingTime')
    })

    it('rejects a message that is missing the config.speechSynthesis field', () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.speechSynthesis
      spyOn(context, 'done')
      func(context, mockMessage)
      expect(context.done).toHaveBeenCalled()
      const args = context.done.calls.allArgs(0)[0]
      expect(args[0].message).toBe('Missing config field: speechSynthesis')
    })
  })
})
