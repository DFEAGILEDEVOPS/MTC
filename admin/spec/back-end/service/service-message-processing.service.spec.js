'use strict'

/* global describe, it, expect spyOn */
const serviceMessageService = require('../../../services/service-message.service')
const serviceMessageProcessingService = require('../../../services/service-message-processing.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')

describe('serviceMessageProcessingService', () => {
  describe('process', () => {
    it('should call redisCacheService.setMessage if no validation error occurs', async () => {
      const validationError1 = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(serviceMessageService, 'setMessage')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await serviceMessageProcessingService.process(requestData)
      expect(serviceMessageService.setMessage).toHaveBeenCalled()
    })
    it('should not call serviceMessageService.setMessage if a validation error occurs', async () => {
      const validationError1 = new ValidationError()
      validationError1.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(serviceMessageService, 'setMessage')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await serviceMessageProcessingService.process(requestData)
      expect(serviceMessageService.setMessage).not.toHaveBeenCalled()
    })
  })
})
