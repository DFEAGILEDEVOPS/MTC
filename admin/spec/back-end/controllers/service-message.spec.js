/* global jasmine describe expect it beforeEach spyOn */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/service-message')
const administrationMessageService = require('../../../services/administration-message.service')
const serviceMessagePresenter = require('../../../helpers/service-message-presenter')
const ValidationError = require('../../../lib/validation-error')

describe('service message controller:', () => {
  let next
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  beforeEach(() => {
    next = jasmine.createSpy('next')
  })
  describe('getServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message'
      }
    })
    it('should render the service message overview page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'getMessage')
      spyOn(res, 'render')
      await controller.getServiceMessage(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
    it('should call administrationMessageService.getMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'getMessage')
      await controller.getServiceMessage(req, res, next)
      expect(administrationMessageService.getMessage).toHaveBeenCalled()
    })
  })
  describe('getServiceMessageForm', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message/service-message-form'
      }
    })
    it('should render the create service message page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(res, 'render')
      await controller.getServiceMessageForm(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })
  })
  describe('postSubmitServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-message/submit-service-message',
        user: {
          id: 1
        },
        body: {}
      }
    })
    it('should call administrationMessageService.setMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'setMessage')
      spyOn(controller, 'getServiceMessage')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(administrationMessageService.setMessage).toHaveBeenCalled()
    })
    it('should call controller.getServiceMessageForm if a validation error is present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      spyOn(administrationMessageService, 'setMessage').and.returnValue(validationError)
      spyOn(controller, 'getServiceMessageForm')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(controller.getServiceMessageForm).toHaveBeenCalled()
    })
    it('should call serviceMessagePresenter.getFlashMessage to identify the appropriate flash message', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'setMessage')
      spyOn(serviceMessagePresenter, 'getFlashMessage')
      spyOn(res, 'redirect')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(serviceMessagePresenter.getFlashMessage).toHaveBeenCalled()
    })
    it('should redirect to the overview page if a validation error is not present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'setMessage')
      spyOn(res, 'redirect')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })
    it('should call req.flash', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'setMessage')
      spyOn(res, 'redirect')
      await controller.postSubmitServiceMessage(req, res, next)
      expect(req.flash).toHaveBeenCalled()
    })
  })
  describe('postRemoveServiceMessage', () => {
    let goodReqParams
    beforeEach(() => {
      goodReqParams = {
        method: 'POST',
        url: '/service-message/remove-service-message',
        user: {
          id: 1
        }
      }
    })
    it('should call administrationMessageService.dropMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'dropMessage')
      await controller.postRemoveServiceMessage(req, res, next)
      expect(administrationMessageService.dropMessage).toHaveBeenCalled()
    })
    it('should call req.flash', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      spyOn(administrationMessageService, 'dropMessage')
      await controller.postRemoveServiceMessage(req, res, next)
      expect(req.flash).toHaveBeenCalled()
    })
  })
})
