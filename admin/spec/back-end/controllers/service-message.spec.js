/* global describe expect beforeEach afterEach jest test describe */
const httpMocks = require('node-mocks-http')
const controller = require('../../../controllers/service-message')
const administrationMessageService = require('../../../services/administration-message.service')
const serviceMessagePresenter = require('../../../helpers/service-message-presenter')
const ValidationError = require('../../../lib/validation-error')
const { ServiceMessageCodesService } = require('../../../services/service-message/service-message.service')
const logger = require('../../../services/log.service').getLogger()
const R = require('ramda')

describe('service message controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    jest.spyOn(res, 'render').mockImplementation()
    jest.spyOn(res, 'redirect').mockImplementation()
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

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getServiceMessage', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message'
      }
    })

    test('should render the service message overview page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'getRawServiceMessages').mockImplementation()
      await controller.getServiceMessage(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('should call administrationMessageService.getRawServiceMessages', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'getRawServiceMessages').mockImplementation()
      await controller.getServiceMessage(req, res, next)
      expect(administrationMessageService.getRawServiceMessages).toHaveBeenCalled()
    })
  })

  describe('getServiceMessageForm', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message/service-message-form'
      }
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockResolvedValue([])
    })

    test('should render the create service message page', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller.getServiceMessageForm(req, res, next)
      expect(res.render).toHaveBeenCalled()
    })

    test('writes to the log when getAreaCodes() throws', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(logger, 'error').mockImplementation()
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockRejectedValue(new Error('test error'))
      await controller.getServiceMessageForm(req, res, next)
      expect(logger.error).toHaveBeenCalledTimes(1)
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
      jest.spyOn(administrationMessageService, 'setMessage').mockImplementation()
      jest.spyOn(controller, 'getEditServiceMessage').mockImplementation()
      jest.spyOn(controller, 'getServiceMessageForm').mockImplementation()
      jest.spyOn(serviceMessagePresenter, 'getFlashMessage').mockImplementation()
    })

    test('should call administrationMessageService.setMessage', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller.postSubmitServiceMessage(req, res, next)
      expect(administrationMessageService.setMessage).toHaveBeenCalled()
    })

    test('should call controller.getServiceMessageForm if a validation error is present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      const validationError = new ValidationError()
      validationError.addError('serviceMessageTitle', 'error')
      jest.spyOn(administrationMessageService, 'setMessage').mockResolvedValue(validationError)
      await controller.postSubmitServiceMessage(req, res, next)
      expect(controller.getServiceMessageForm).toHaveBeenCalled()
    })

    test('should call serviceMessagePresenter.getFlashMessage to identify the appropriate flash message', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller.postSubmitServiceMessage(req, res, next)
      expect(serviceMessagePresenter.getFlashMessage).toHaveBeenCalled()
    })

    test('should redirect to the overview page if a validation error is not present', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      await controller.postSubmitServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalled()
    })

    test('should call req.flash', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
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

    test('it calls redirect with a flash message if validation fails', async () => {
      const reqConfig = R.clone(goodReqParams)
      reqConfig.params.slug = 'invalid-uuid-to-fail-validation'
      const res = getRes()
      const req = getReq(reqConfig)
      jest.spyOn(administrationMessageService, 'dropMessage').mockImplementation()
      await controller.postRemoveServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/service-message/')
      expect(req.flash).toHaveBeenCalledWith('info', 'slug is not a valid UUID')
    })
  })

  describe('getEditServiceMessage', () => {
    let goodReqParams

    beforeEach(() => {
      goodReqParams = {
        method: 'GET',
        url: '/service-message/edit-service-message',
        user: {
          id: 1
        },
        params: {
          slug: 'd5e5df99-a69b-409c-8c2e-4adffd9f4254'
        }
      }
      jest.spyOn(administrationMessageService, 'getRawMessageBySlug').mockImplementation()
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockImplementation()
      jest.spyOn(logger, 'error').mockImplementation()
    })

    test('it fetches the raw service message so it can be edited', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(administrationMessageService, 'getRawMessageBySlug').mockResolvedValue({
        title: 'A message title',
        message: '# subheading \n and markdown here',
        urlSlug: 'd5e5df99-a69b-409c-8c2e-4adffd9f4254',
        borderColour: 'G',
        areaCodes: ['A']
      })
      jest.spyOn(ServiceMessageCodesService, 'getAreaCodes').mockResolvedValue([
        { code: 'A', description: 'A code' }
      ])
      jest.spyOn(logger, 'error').mockImplementation() // hush the outpt from the catch block
      await controller.getEditServiceMessage(req, res, next)
      expect(administrationMessageService.getRawMessageBySlug).toHaveBeenCalledTimes(1)
    })

    test('it redirects back to the overview page if the service-message is not set', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(administrationMessageService, 'getRawMessageBySlug').mockResolvedValue(undefined)
      await controller.getEditServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenLastCalledWith('/service-message/')
    })

    test('it calls next if there is an error', async () => {
      const res = getRes()
      const req = getReq(goodReqParams)
      // arbitrarily choose `getRawMessageBySlug` to throw
      jest.spyOn(administrationMessageService, 'getRawMessageBySlug').mockRejectedValue(new Error('a mock error test'))
      await controller.getEditServiceMessage(req, res, next)
      expect(next).toHaveBeenCalledTimes(1)
    })

    test('it calls redirect with a flash message if validation fails', async () => {
      const reqConfig = R.clone(goodReqParams)
      reqConfig.params.slug = 'invalid-uuid-to-fail-validation'
      const res = getRes()
      const req = getReq(reqConfig)
      await controller.getEditServiceMessage(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/service-message/')
      expect(req.flash).toHaveBeenCalledWith('info', 'slug is not a valid UUID')
    })
  })
})
