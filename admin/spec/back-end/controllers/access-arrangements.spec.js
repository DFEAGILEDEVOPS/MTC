'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')

const controller = require('../../../controllers/access-arrangements')
const accessArrangementsService = require('../../../services/access-arrangements.service')
const questionReaderReasonsService = require('../../../services/question-reader-reasons.service')
const pupilService = require('../../../services/pupil.service')

describe('access arrangements controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = {School: 9991001}
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  beforeEach(() => {
    next = jasmine.createSpy('next')
  })

  describe('getOverview route', () => {
    let reqParams = {
      method: 'GET',
      url: '/access-arrangements/overview'
    }

    it('displays the access arrangements overview page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      await controller.getOverview(req, res)
      expect(res.locals.pageTitle).toBe('Access arrangements')
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('getSelectAccessArrangements route', () => {
    let reqParams = {
      method: 'GET',
      url: '/access-arrangements/select-access-arrangements'
    }

    it('displays the select access arrangements page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      spyOn(accessArrangementsService, 'getAccessArrangements')
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(pupilService, 'getPupilsWithFullNames')
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.locals.pageTitle).toBe('Select access arrangement for pupil')
      expect(res.render).toHaveBeenCalled()
      expect(accessArrangementsService.getAccessArrangements).toHaveBeenCalled()
      expect(questionReaderReasonsService.getQuestionReaderReasons).toHaveBeenCalled()
      expect(pupilService.getPupilsWithFullNames).toHaveBeenCalled()
    })
    it('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'render')
      const error = new Error('error')
      spyOn(accessArrangementsService, 'getAccessArrangements').and.returnValue(Promise.reject(error))
      spyOn(questionReaderReasonsService, 'getQuestionReaderReasons')
      spyOn(pupilService, 'getPupilsWithFullNames')
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(questionReaderReasonsService.getQuestionReaderReasons).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      expect(pupilService.getPupilsWithFullNames).not.toHaveBeenCalled()
    })
  })
  describe('postSubmitAccessArrangements route', () => {
    let reqParams = {
      method: 'POST',
      url: '/access-arrangements/submit',
      body: {
      },
      user: {
        id: 1,
        School: 1
      }
    }
    it('submits pupils access arrangements', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      spyOn(accessArrangementsService, 'submit').and.returnValue({id: 1, foreName: 'foreName', lastName: 'lastName'})
      await controller.postSubmitAccessArrangements(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(accessArrangementsService.submit).toHaveBeenCalled()
    })
    it('calls next if accessArrangementsService submit throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      spyOn(res, 'redirect')
      const error = new Error('error')
      spyOn(accessArrangementsService, 'submit').and.returnValue(Promise.reject(error))
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
