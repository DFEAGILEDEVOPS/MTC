'use strict'
/* global describe beforeEach it expect spyOn */

const proxyquire = require('proxyquire').noCallThru()
const checkFormMock = require('../mocks/checkform')
const MongooseModelMock = require('../mocks/mongoose-model-mock')

describe('check-form.service', () => {
  let service

  function setupService (cb) {
    return proxyquire('../../services/check-form.service', {
      '../models/check-form': new MongooseModelMock(cb)
    })
  }

  describe('happy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(checkFormMock) })
    })

    it('returns a check-form', async (done) => {
      try {
        const checkForm = await service.allocateCheckForm()
        expect(checkForm).toEqual(checkFormMock)
        done()
      } catch (error) {
        console.error(error)
        expect('not expected to throw').toBe(error.message)
        done()
      }
    })

    describe('prepareQuestionData()', () => {
      it('prepares the question data', async (done) => {
        try {
          const checkForm = await service.allocateCheckForm()
          const questions = service.prepareQuestionData(checkForm)
          expect(Array.isArray(questions)).toBeTruthy()
          expect(questions.length).toBe(checkFormMock.questions.length)
          questions.forEach((q) => {
            expect(q.hasOwnProperty('order')).toBeTruthy()
            expect(q.hasOwnProperty('factor1')).toBeTruthy()
            expect(q.hasOwnProperty('factor2')).toBeTruthy()
          })
        } catch (error) {
          console.error(error)
          expect('not expected to throw').toBe(error.message)
          done()
        }
        done()
      })
    })

    describe('getQuestions()', () => {
      it('returns a set of questions', async (done) => {
        const allocateCheckFormSpy = spyOn(service, 'allocateCheckForm')
        const prepareQuestionDataSpy = spyOn(service, 'prepareQuestionData')
        await service.getQuestions()
        expect(allocateCheckFormSpy).toHaveBeenCalledTimes(1)
        expect(prepareQuestionDataSpy).toHaveBeenCalledTimes(1)
        done()
      })
    })
  })

  describe('allocateCheckForm() unhappy path', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(null) })
    })

    it('throws when the check-form is not found', async (done) => {
      try {
        await service.allocateCheckForm()
        expect('not expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('CheckForm not found')
      }
      done()
    })
  })
})
