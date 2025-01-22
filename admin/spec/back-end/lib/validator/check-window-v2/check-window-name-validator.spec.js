'use strict'

const checkWindowErrorMessages = require('../../../../../lib/errors/check-window-v2')
const ValidationError = require('../../../../../lib/validation-error')
const checkWindowNameValidator = require('../../../../../lib/validator/check-window-v2/check-window-name-validator')

describe('Check window name validator', function () {
  describe('validate', function () {
    test('should not call addError method if the validation is successful', () => {
      const validationError = new ValidationError()
      jest.spyOn(validationError, 'addError').mockImplementation()
      checkWindowNameValidator.validate(validationError, 'checkWindowName')
      expect(validationError.addError).not.toHaveBeenCalled()
    })
    test('should call addError method with checkWindowName and checkWindowNameLength errors if the check window name is missing', () => {
      const validationError = new ValidationError()
      jest.spyOn(validationError, 'addError').mockImplementation()
      checkWindowNameValidator.validate(validationError, '')
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
    })
    test('should call addError method with checkWindowName and checkWindowNameLength errors if the check window name is only 1 character', () => {
      const validationError = new ValidationError()
      jest.spyOn(validationError, 'addError').mockImplementation()
      checkWindowNameValidator.validate(validationError, '')
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
    })
    test('should call addError method checkWindowNameLength errors if the check window name exceeds allowed length', () => {
      const validationError = new ValidationError()
      jest.spyOn(validationError, 'addError').mockImplementation()
      checkWindowNameValidator.validate(validationError, 'checkwindowabcdefghijklmnopqrstuvwxyz1234567890')
      expect(validationError.addError).toHaveBeenCalledWith('checkWindowName', checkWindowErrorMessages.checkWindowNameLength)
    })
  })
})
