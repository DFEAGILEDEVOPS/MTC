'use strict'

/* global describe, it, expect, spyOn */

const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const schoolImpersonationValidator = require('../../../lib/validator/school-impersonation-validator')
const ValidationError = require('../../../lib/validation-error')

describe('schoolImpersonationService', () => {
  describe('setSchoolImpersonation', () => {
    it('calls schoolImpersonationService.impersonateSchool if no validation occurred', async () => {
      const validationError = new ValidationError()
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').and.returnValue(validationError)
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      const dfeNumber = '1230000'
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationService.impersonateSchool).toHaveBeenCalled()
    })
    it('returns a validation error if schoolImpersonationValidator.isDfeNumberValid returned a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(validationError)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationValidator, 'isSchoolRecordValid')
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      const dfeNumber = undefined
      const result = await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(result).toEqual(validationError)
      expect(schoolDataService.sqlFindOneByDfeNumber).not.toHaveBeenCalled()
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalled()
      expect(schoolImpersonationValidator.isSchoolRecordValid).not.toHaveBeenCalled()
      expect(schoolImpersonationService.impersonateSchool).not.toHaveBeenCalled()
    })
    it('returns a validation error if schoolImpersonationValidator.isSchoolRecordValid returned a validation error', async () => {
      const validationError1 = new ValidationError()
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(validationError1)
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      const validationError2 = new ValidationError()
      validationError2.addError('dfeNumber', 'error')
      spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').and.returnValue(validationError2)
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      const dfeNumber = 'dfeNumber'
      const result = await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(result).toEqual(validationError2)
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
      expect(schoolDataService.sqlFindOneByDfeNumber).toHaveBeenCalled()
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalled()
      expect(schoolImpersonationValidator.isSchoolRecordValid).toHaveBeenCalled()
      expect(schoolImpersonationService.impersonateSchool).not.toHaveBeenCalled()
    })
    it('detects and trims leading spaces in the dfeNumber', async () => {
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(new ValidationError())
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      const dfeNumber = ' 1230000'
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
    })
    it('detects and trims trailing spaces in the dfeNumber', async () => {
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(new ValidationError())
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      const dfeNumber = '1230000 '
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
    })
    it('detects and removes non digits within the dfe number', async () => {
      spyOn(schoolImpersonationValidator, 'isDfeNumberValid').and.returnValue(new ValidationError())
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      spyOn(schoolImpersonationService, 'impersonateSchool')
      const user = {}
      await schoolImpersonationService.setSchoolImpersonation(user, '123-0000')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
      await schoolImpersonationService.setSchoolImpersonation(user, '1-23-0000')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
      await schoolImpersonationService.setSchoolImpersonation(user, '123/0000')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
      await schoolImpersonationService.setSchoolImpersonation(user, '123.0000')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
      await schoolImpersonationService.setSchoolImpersonation(user, '123000*0')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
      await schoolImpersonationService.setSchoolImpersonation(user, '.1230000')
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
    })
  })

  describe('impersonateSchool', () => {
    it('populates the user session object without school related data', () => {
      const school = { dfeNumber: 1230000, id: 1, timezone: '' }
      const user = { role: 'helpdesk' }
      schoolImpersonationService.impersonateSchool(user, school)
      expect(user).toEqual({ School: 1230000, schoolId: 1, timezone: '', role: 'helpdesk' })
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
