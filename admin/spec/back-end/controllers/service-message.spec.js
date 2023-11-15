/* global describe expect beforeEach afterEach jest test xdescribe */
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
    jest.spyOn(res, 'render').mockImplementation()
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  xdescribe('getServiceMessage', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message'
      }
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    test('should render the service message overview page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'getMessage').mockImplementation()
      await controller.getServiceMessage(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('should call administrationMessageService.getMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'getMessage').mockImplementation()
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

    test('should render the create service message page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
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

    test('should call administrationMessageService.setMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'setMessage').mockImplementation()
      jest.spyOn(controller, 'getServiceMessage').mockImplementation()
      await controller.postSubmitServiceMessage(req, res, next)
      expect(administrationMessageService.setMessage).toHaveBeenCalled()
    })

    test('should call controller.getServiceMessageForm if a validation error is present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(administrationMessageService, 'setMessage').mockResolvedValue(validationError)
      jest.spyOn(controller, 'getServiceMessageForm').mockImplementation()
      await controller.postSubmitServiceMessage(req, res, next)
      expect(controller.getServiceMessageForm).toHaveBeenCalled()
    })

    test('should call serviceMessagePresenter.getFlashMessage to identify the appropriate flash message', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'setMessage').mockImplementation()
      jest.spyOn(serviceMessagePresenter, 'getFlashMessage').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
      await controller.postSubmitServiceMessage(req, res, next)
      expect(serviceMessagePresenter.getFlashMessage).toHaveBeenCalled()
    })

    test('should redirect to the overview page if a validation error is not present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'setMessage').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
      await controller.postSubmitServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })

    test('should call req.flash', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'setMessage').mockImplementation()
      jest.spyOn(res, 'redirect').mockImplementation()
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
        },
        params: {
          slug: '8519fd9f-e7e6-482f-b5cd-9e7690e48251'
        }
      }
    })

    test('should call administrationMessageService.dropMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'dropMessage').mockImplementation()
      await controller.postRemoveServiceMessage(req, res, next)
      expect(administrationMessageService.dropMessage).toHaveBeenCalled()
    })

    test('should call req.flash', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'dropMessage').mockImplementation()
      await controller.postRemoveServiceMessage(req, res, next)
      expect(req.flash).toHaveBeenCalled()
    })
  })

  xdescribe('getEditServiceMessage', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message/edit-service-message',
        user: {
          id: 1
        }
      }
    })

    test('it fetches the raw service message so it can be edited', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'fetchMessage').mockResolvedValue({
        title: 'A message title',
        message: '# subheading \n and markdown here',
        id: 1
      })
      await controller.getEditServiceMessage(req, res, next)
      expect(administrationMessageService.fetchMessage).toHaveBeenCalledTimes(1)
    })

    test('it redirects back to the overview page if the service-message is not set', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(administrationMessageService, 'fetchMessage').mockResolvedValue(undefined)
      await controller.getEditServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenLastCalledWith('/service-message/')
    })

    test('it calls next if there is an error', async () => {
      const res = getRes()
      const req = getReq()
      // arbitrarily choose `fetchMessage` to throw
      jest.spyOn(administrationMessageService, 'fetchMessage').mockRejectedValue(new Error('a mock error from unit' +
        ' test'))
      await controller.getEditServiceMessage(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })
  })
})
