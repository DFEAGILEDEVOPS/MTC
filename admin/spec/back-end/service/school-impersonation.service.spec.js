'use strict'

/* global describe, it, expect, spyOn */

const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const schoolImpersonationEmptyValueValidator = require('../../../lib/validator/school-impersonation/school-impersonation-empty-value-validator')
const schoolImpersonationDfeNumberValidator = require('../../../lib/validator/school-impersonation/school-impersonation-dfe-number-validator')
const ValidationError = require('../../../lib/validation-error')

describe('schoolImpersonationService', () => {
  describe('validateCreateImpersonation', () => {
    it('returns the user session object if no validation occurred', async () => {
      const validationError = new ValidationError()
      spyOn(schoolImpersonationEmptyValueValidator, 'validate').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationDfeNumberValidator, 'validate').and.returnValue(validationError)
      const user = {}
      const dfeNumber = '1230000'
      const result = await schoolImpersonationService.validateCreateImpersonation(user, dfeNumber)
      expect(result).toEqual({ School: '1230000', schoolId: 1, timezone: '' })
    })
    it('returns a validation error if schoolImpersonationEmptyValueValidator returned a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationEmptyValueValidator, 'validate').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationDfeNumberValidator, 'validate').and.returnValue(validationError)
      const user = {}
      const dfeNumber = undefined
      const result = await schoolImpersonationService.validateCreateImpersonation(user, dfeNumber)
      expect(result).toEqual(validationError)
      expect(schoolDataService.sqlFindOneByDfeNumber).not.toHaveBeenCalled()
      expect(schoolImpersonationDfeNumberValidator.validate).not.toHaveBeenCalled()
    })
    it('returns a validation error if schoolImpersonationDfeNumberValidator returned a validation error', async () => {
      const validationError1 = new ValidationError()
      spyOn(schoolImpersonationEmptyValueValidator, 'validate').and.returnValue(validationError1)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      const validationError2 = new ValidationError()
      validationError2.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationDfeNumberValidator, 'validate').and.returnValue(validationError2)
      const user = {}
      const dfeNumber = 'dfeNumber'
      const result = await schoolImpersonationService.validateCreateImpersonation(user, dfeNumber)
      expect(result).toEqual(validationError2)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
      expect(schoolImpersonationDfeNumberValidator.validate).toHaveBeenCalled()
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
