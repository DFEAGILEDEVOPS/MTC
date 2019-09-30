'use strict'

/* global describe, it, expect, spyOn */

const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const schoolImpersonationDfeNumberValidator = require('../../../lib/validator/school-impersonation-dfe-number-validator')
const ValidationError = require('../../../lib/validation-error')

describe('schoolImpersonationService', () => {
  describe('validateImpersonationForm', () => {
    it('returns the user session object if no validation occurred', async () => {
      const validationError = new ValidationError()
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberEmpty').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberValid').and.returnValue(validationError)
      const user = {}
      const dfeNumber = '1230000'
      const result = await schoolImpersonationService.validateImpersonationForm(user, dfeNumber)
      expect(result).toEqual({ School: '1230000', schoolId: 1, timezone: '' })
    })
    it('returns a validation error if schoolImpersonationDfeNumberValidator.isDfeNumberEmpty returned a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberEmpty').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberValid').and.returnValue(validationError)
      const user = {}
      const dfeNumber = undefined
      const result = await schoolImpersonationService.validateImpersonationForm(user, dfeNumber)
      expect(result).toEqual(validationError)
      expect(schoolDataService.sqlFindOneByDfeNumber).not.toHaveBeenCalled()
      expect(schoolImpersonationDfeNumberValidator.isDfeNumberEmpty).toHaveBeenCalled()
      expect(schoolImpersonationDfeNumberValidator.isDfeNumberValid).not.toHaveBeenCalled()
    })
    it('returns a validation error if schoolImpersonationDfeNumberValidator.isDfeNumberValid returned a validation error', async () => {
      const validationError1 = new ValidationError()
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberEmpty').and.returnValue(validationError1)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      const validationError2 = new ValidationError()
      validationError2.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationDfeNumberValidator, 'isDfeNumberValid').and.returnValue(validationError2)
      const user = {}
      const dfeNumber = 'dfeNumber'
      const result = await schoolImpersonationService.validateImpersonationForm(user, dfeNumber)
      expect(result).toEqual(validationError2)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
      expect(schoolImpersonationDfeNumberValidator.isDfeNumberValid).toHaveBeenCalled()
    })
  })
  describe('removeImpersonation', () => {
    it('returns the user session object without school related data', () => {
      const user = { School: '1230000', schoolId: 1, timezone: '', role: 'helpdesk' }
      schoolImpersonationService.removeImpersonation(user)
      expect(user).toEqual({ role: 'helpdesk' })
    })
  })
})
