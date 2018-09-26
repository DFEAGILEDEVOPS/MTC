'use strict'

/* global describe, it, spyOn expect */
const moment = require('moment')
const dateService = require('../../../../../services/date.service')
const newCheckWindowAddValidator = require('../../../../../lib/validator/new-check-window/new-check-window-add-validator')

const newCheckWindowNameValidator = require('../../../../../lib/validator/new-check-window/new-check-window-name-validator')
const newCheckWindowAdminStartDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-admin-start-date-validator')
const newCheckWindowAdminEndDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-admin-end-date-validator')
const newCheckWindowFamiliarisationCheckStartDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-familiarisation-check-start-date-validator')
const newCheckWindowFamiliarisationCheckEndDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-familiarisation-check-end-date-validator')
const newCheckWindowLiveCheckStartDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-live-check-start-date-validator')
const newCheckWindowLiveCheckEndDateValidator = require('../../../../../lib/validator/new-check-window/new-check-window-live-check-end-date-validator')

describe('New check window add validator', function () {
  describe('validate', function () {
    it('returns validationError object', () => {
      spyOn(newCheckWindowNameValidator, 'validate')
      spyOn(newCheckWindowAdminStartDateValidator, 'validate')
      spyOn(newCheckWindowAdminEndDateValidator, 'validate')
      spyOn(newCheckWindowFamiliarisationCheckStartDateValidator, 'validate')
      spyOn(newCheckWindowFamiliarisationCheckEndDateValidator, 'validate')
      spyOn(newCheckWindowLiveCheckStartDateValidator, 'validate')
      spyOn(newCheckWindowLiveCheckEndDateValidator, 'validate')
      const validationError = newCheckWindowAddValidator.validate({})
      expect(newCheckWindowAdminEndDateValidator.validate).toHaveBeenCalled()
      expect(newCheckWindowAdminStartDateValidator.validate).toHaveBeenCalled()
      expect(newCheckWindowFamiliarisationCheckStartDateValidator.validate).toHaveBeenCalled()
      expect(newCheckWindowFamiliarisationCheckEndDateValidator.validate).toHaveBeenCalled()
      expect(newCheckWindowLiveCheckStartDateValidator.validate).toHaveBeenCalled()
      expect(newCheckWindowLiveCheckEndDateValidator.validate).toHaveBeenCalled()
      expect(validationError.hasError()).toBeFalsy()
    })
  })
})
