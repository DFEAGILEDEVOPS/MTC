/* global describe it expect spyOn */

const func = require('./index')
const R = require('ramda')
const azureStorageHelper = require('../lib/azure-storage-helper')
const mockTableService = require('../lib/mock-table-service')

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
      tokens: {
        sasToken: '0f824632-8fab-49c6-a5ac-818b485fff96',
        jwtToken: 'someToken'
      }
    }

    const context = require('../mock-context')

    beforeEach(() => {
      spyOn(azureStorageHelper, 'getPromisifiedAzureTableService').and.returnValue(mockTableService)
      spyOn(mockTableService, 'insertEntityAsync')
    })

    it('validates a valid message', async () => {
      spyOn(context, 'done')
      try {
        await func(context, validMessage)
        expect(true).toBe(true) // no jasmine success()
      } catch(error) {
        fail()
      }
    })

    it('rejects a message that is missing a schoolPin', async () => {
      const mockMessage = R.omit(['schoolPin'], validMessage)
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Message failed validation check: missing field: schoolPin')
      }
    })

    it('rejects a message that is missing a pupilPin', async () => {
      const mockMessage = R.omit(['pupilPin'], validMessage)
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Message failed validation check: missing field: pupilPin')
      }
    })

    it('rejects a message that is missing a pupil', async () => {
      const mockMessage = R.omit(['pupil'], validMessage)
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Message failed validation check: missing field: pupil')
      }
    })

    it('rejects a message that is missing a school', async () => {
      const mockMessage = R.omit(['school'], validMessage)
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Message failed validation check: missing field: school')
      }
    })

    it('rejects a message that is missing a sasToken', async () => {
      const mockMessage = R.omit(['tokens'], validMessage)
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Message failed validation check: missing field: tokens')
      }
    })

    it('rejects a message when the pupil property is not an object', async () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.pupil = 'Pupil Name Instead Of Object'
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('pupil is not an object')
      }
    })

    it('rejects a message that is missing a pupil.firstName field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.firstName
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing pupil field: firstName')
      }
    })

    it('rejects a message that is missing a pupil.lastName field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.lastName
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing pupil field: lastName')
      }
    })

    it('rejects a message that is missing a pupil.dob field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.pupil.dob
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing pupil field: dob')
      }
    })

    it('rejects a message that is missing a set of questions', async () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.questions = 'a string instead of an array'
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Questions is not an Array')
      }
    })

    it('rejects a message that is entirely composed of questions objects', async () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.questions = [
        { order: 1, factor1: 1, factor2: 1 },
        { order: 2, factor1: 1, factor2: 2 },
        { invalid: 'object' }
      ]
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Invalid question')
      }
    })

    it('rejects a message when the school property is not an object', async () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.school = 'School of many pupils'
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('school is not an object')
      }
    })

    it('rejects a message that is missing the school.id field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.school.id
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing school field: id')
      }
    })

    it('rejects a message that is missing the school.name field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.school.name
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing school field: name')
      }
    })

    it('rejects a message when the config property is not an object', async () => {
      const mockMessage = R.clone(validMessage)
      mockMessage.config = 'erroneous config string'
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('config is not an object')
      }
    })

    it('rejects a message that is missing the config.questionTime field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.questionTime
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing config field: questionTime')
      }
    })

    it('rejects a message that is missing the config.loadingTime field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.loadingTime
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing config field: loadingTime')
      }
    })

    it('rejects a message that is missing the config.speechSynthesis field', async () => {
      const mockMessage = R.clone(validMessage)
      delete mockMessage.config.speechSynthesis
      try {
        await func(context, mockMessage)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing config field: speechSynthesis')
      }
    })
  })
})
