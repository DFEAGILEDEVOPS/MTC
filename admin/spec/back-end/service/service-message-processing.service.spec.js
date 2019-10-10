'use strict'

/* global describe, it, expect spyOn */
const redisCacheService = require('../../../services/redis-cache.service')
const serviceMessageProcessingService = require('../../../services/service-message-processing.service')
const emptyFieldsValidator = require('../../../lib/validator/common/empty-fields-validators')
const ValidationError = require('../../../lib/validation-error')

describe('serviceMessageProcessingService', () => {
  describe('process', () => {
    it('should call redisCacheService.set if no validation error occurs', async () => {
      const validationError1 = new ValidationError()
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(redisCacheService, 'set')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await serviceMessageProcessingService.process(requestData)
      expect(redisCacheService.set).toHaveBeenCalled()
    })
    it('should not call redisCacheService.set if a validation error occurs', async () => {
      const validationError1 = new ValidationError()
      validationError1.addError('serviceMessageTitle', 'error')
      spyOn(emptyFieldsValidator, 'validate').and.returnValues(validationError1)
      spyOn(redisCacheService, 'set')
      const requestData = { serviceMessageTitle: 'serviceMessageTitle', serviceMessageContent: 'serviceMessageContent' }
      await serviceMessageProcessingService.process(requestData)
      expect(redisCacheService.set).not.toHaveBeenCalled()
    })
  })
})
