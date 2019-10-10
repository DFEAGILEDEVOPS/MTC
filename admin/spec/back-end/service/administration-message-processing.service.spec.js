'use strict'

/* global describe, it, expect spyOn */
const administrationMessageService = require('../../../services/administration-message.service')
const administrationMessageProcessingService = require('../../../services/administration-message-processing.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')

describe('administrationMessageProcessingService', () => {
  describe('process', () => {
    it('should call redisCacheService.setMessage if no validation error occurs', async () => {
      const validationError1 = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(administrationMessageService, 'setMessage')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await administrationMessageProcessingService.process(requestData)
      expect(administrationMessageService.setMessage).toHaveBeenCalled()
    })
    it('should not call administrationMessageService.setMessage if a validation error occurs', async () => {
      const validationError1 = new ValidationError()
      validationError1.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(administrationMessageService, 'setMessage')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await administrationMessageProcessingService.process(requestData)
      expect(administrationMessageService.setMessage).not.toHaveBeenCalled()
    })
  })
})
