'use strict'
/* global describe, beforeEach, it, expect, jasmine, fail, spyOn */

const httpMocks = require('node-mocks-http')
const proxyquire = require('proxyquire').noCallThru()
const uuidv4 = require('uuid/v4')

const pupilLoginEventService = require('../../services/pupil-logon-event.service')

const pupilMockOrig = require('../mocks/pupil')
const schoolMock = require('../mocks/school')
const pupilMock = {}
// prevent node caching the school under the pupil for every test
Object.assign(pupilMock, pupilMockOrig)
pupilMock.school = schoolMock
const jwtTokenMock = require('../mocks/jwtToken')
const configMock = require('../mocks/config')
const questionsMock = require('../mocks/check-form.service.getQuestions')
const checkStartResponseMock = {
  checkCode: uuidv4(),
  questions: require('../mocks/check-form').questions
}

const getPupilDataForSpaMock = {
  firstName: 'Test',
  lastName: 'User',
  dob: '1 January 2000'
}

describe('Questions controller', () => {
  let goodReq, res, pupilCheckSpy, authenticateSpy, getPupilDataForSpaSpy, getConfigSpy, jwtSpy, prepareQuestionDataSpy

  beforeEach(() => {
    res = httpMocks.createResponse()
    spyOn(pupilLoginEventService, 'storeLogonEvent')

    goodReq = httpMocks.createRequest({
      method: 'POST',
      url: '/api/questions',
      session: {
        id: 'ArRFdOiz1xI8w0ljtvVuD6LU39pcfgqy'
      },
      body: {
        pupilPin: 'pin',
        schoolPin: 'pin'
      }
    })
  })

  function setupController (options = {}) {
    if (!options['pupil-authentication.service.authenticate']) {
      options['pupil-authentication.service.authenticate'] = function () { return Promise.resolve({ pupil: pupilMock, school: schoolMock }) }
    }
    if (!options['check-form.service.prepareQuestionData']) {
      options['check-form.service.prepareQuestionData'] = function () { return questionsMock }
    }
    if (!options['config.service.getConfig']) {
      options['config.service.getConfig'] = function () { return Promise.resolve(configMock) }
    }
    if (!options['jwt.service.createToken']) {
      options['jwt.service.createToken'] = function () { return Promise.resolve(jwtTokenMock) }
    }
    if (!options['check-start.service.pupilLogin']) {
      options['check-start.service.pupilLogin'] = function () { return Promise.resolve(checkStartResponseMock) }
    }
    if (!options['pupil-authentication.service.getPupilDataForSpa']) {
      options['pupil-authentication.service.getPupilDataForSpa'] = function () { return getPupilDataForSpaMock }
    }

    // Spy setup
    pupilCheckSpy = jasmine.createSpy().and.callFake(options['check-start.service.pupilLogin'])
    authenticateSpy = jasmine.createSpy().and.callFake(options['pupil-authentication.service.authenticate'])
    getPupilDataForSpaSpy = jasmine.createSpy().and.callFake(options['pupil-authentication.service.getPupilDataForSpa'])
    getConfigSpy = jasmine.createSpy().and.callFake(options['config.service.getConfig'])
    jwtSpy = jasmine.createSpy().and.callFake(options['jwt.service.createToken'])
    prepareQuestionDataSpy = jasmine.createSpy().and.callFake(options['check-form.service.prepareQuestionData'])

    return proxyquire('../../controllers/questions', {
      '../services/pupil-authentication.service': {
        authenticate: authenticateSpy,
        getPupilDataForSpa: getPupilDataForSpaSpy
      },
      '../services/config.service': {
        getConfig: getConfigSpy
      },
      '../services/jwt.service': {
        createToken: jwtSpy
      },
      '../services/check-start.service': {
        pupilLogin: pupilCheckSpy
      },
      '../services/check-form.service': {
        prepareQuestionData: prepareQuestionDataSpy
      }
    })
  }

  describe('happy path', () => {
    it('returns a valid response', async (done) => {
      const req = goodReq
      const controller = setupController()
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        expect('questions controller not to').toBe('error')
        done()
      }
      const data = JSON.parse(res._getData())
      const q1 = data.questions[0]
      expect(q1.hasOwnProperty('factor1')).toBeTruthy()
      expect(q1.hasOwnProperty('factor2')).toBeTruthy()
      expect(q1.hasOwnProperty('order')).toBeTruthy()
      expect(res.statusCode).toBe(200)
      expect(data.questions.length).toBe(20)
      expect(data.pupil.firstName).toBe('Test')
      expect(data.school.name).toBe('Example School One')
      expect(data.config.questionTime).toBe(6)
      expect(pupilCheckSpy).toHaveBeenCalledTimes(1)
      expect(authenticateSpy).toHaveBeenCalledTimes(1)
      expect(getPupilDataForSpaSpy).toHaveBeenCalledTimes(1)
      expect(getConfigSpy).toHaveBeenCalledTimes(1)
      expect(jwtSpy).toHaveBeenCalledTimes(1)
      expect(prepareQuestionDataSpy).toHaveBeenCalledTimes(1)
      done()
    })
  })

  describe('unhappy paths', () => {
    it('returns a bad request if the pupil pin is not entered', async (done) => {
      const req = goodReq
      req.body = { schoolPin: 'pin' }
      const controller = setupController()
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns a bad request if the school pin is not entered', async (done) => {
      const req = goodReq
      req.body = { schoolPin: 'pin' }
      const controller = setupController()
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns a bad request if the school pin is not entered and the pupilPin is empty', async (done) => {
      const req = goodReq
      req.body = { pupilPin: '' }
      const controller = setupController()
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns a bad request if the school pin and pupil pin are empty', async (done) => {
      const req = goodReq
      req.body = { pupilPin: '', schoolPin: '' }
      const controller = setupController()
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(400)
      expect(data.error).toBe('Bad request')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns unauthorised is the pupil authorisation service returns unauthorised', async (done) => {
      const req = goodReq
      const controller = setupController({
        'pupil-authentication.service.authenticate': function () { return Promise.reject(new Error('a mock')) }
      })
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns server error if the config service throws', async (done) => {
      const req = goodReq
      const controller = setupController({
        'config.service.getConfig': function () { return Promise.reject(new Error('a mock')) }
      })
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns server error if the jwt service throws', async (done) => {
      const req = goodReq
      const controller = setupController({
        'jwt.service.createToken': function () { return Promise.reject(new Error('a mock')) }
      })
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)
        fail('not expected to throw')
        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })

    it('returns server error if the checkStart service throws', async (done) => {
      const req = goodReq
      const controller = setupController({
        'check-start.service.pupilLogin': function () { return Promise.reject(new Error('a mock')) }
      })
      try {
        await controller.getQuestions(req, res)
      } catch (error) {
        console.error(error)

        done()
      }
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(500)
      expect(data.error).toBe('Server error')
      expect(pupilLoginEventService.storeLogonEvent).toHaveBeenCalled()
      done()
    })
  })
})
