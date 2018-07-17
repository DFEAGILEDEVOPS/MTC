'use strict'

/* global describe, it, spyOn expect */
const checkWindowErrorMessages = require('../../../../lib/errors/check-window')
const ValidationError = require('../../../../lib/validation-error')
const checkWindowNameValidator = require('../../../../lib/validator/check-window/check-window-name-validator')

describe('Check window name validator', function () {
  describe('validate', function () {
    it('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      checkWindowNameValidator.validate(validationError, 'checkWindowName')
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    it('should call addError method with checkWindowName and checkWindowNameLength errors if the check window name is missing', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      checkWindowNameValidator.validate(validationError, '')
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowName)
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
    })
    it('should call addError method checkWindowNameLength errors if the check window name exceeds allowed length', () => {
      const validationError = new ValidationError()
      spyOn(validationError, 'addError')
      checkWindowNameValidator.validate(validationError, 'checkwindowabcdefghijklmnopqrstuvwxyz1234567890')
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
    })
  })
})
