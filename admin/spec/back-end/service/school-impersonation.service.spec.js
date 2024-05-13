'use strict'

/* global describe, test, expect, jest, afterEach */

const schoolDataService = require('../../../services/data-access/school.data.service')
const schoolImpersonationService = require('../../../services/school-impersonation.service')
const schoolImpersonationValidator = require('../../../lib/validator/school-impersonation-validator')
const ValidationError = require('../../../lib/validation-error')
const schoolAuditDataService = require('../../../services/data-access/school-audit.data.service')

describe('schoolImpersonationService', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('setSchoolImpersonation', () => {
    test('calls schoolImpersonationService.impersonateSchool if no validation error occurred', async () => {
      const validationError = new ValidationError()
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(validationError)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').mockReturnValue(validationError)
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      jest.spyOn(schoolAuditDataService, 'auditImpersonation').mockImplementation()
      const user = {}
      const dfeNumber = '1230000'
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationService.impersonateSchool).toHaveBeenCalled()
    })
    test('impersonation events are audited', async () => {
      const validationError = new ValidationError()
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(validationError)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').mockReturnValue(validationError)
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      jest.spyOn(schoolAuditDataService, 'auditImpersonation').mockImplementation()
      const user = {}
      const dfeNumber = '1230000'
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolAuditDataService.auditImpersonation).toHaveBeenCalled()
    })
    test('returns a validation error if schoolImpersonationValidator.isDfeNumberValid returned a validation error', async () => {
      const validationError = new ValidationError()
      validationError.addError('dfeNumber', 'error')
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(validationError)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockReturnValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').mockImplementation()
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      const user = {}
      const dfeNumber = undefined
      const result = await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(result).toEqual(validationError)
      expect(schoolDataService.sqlFindOneByDfeNumber).not.toHaveBeenCalled()
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalled()
      expect(schoolImpersonationValidator.isSchoolRecordValid).not.toHaveBeenCalled()
      expect(schoolImpersonationService.impersonateSchool).not.toHaveBeenCalled()
    })
    test('returns a validation error if schoolImpersonationValidator.isSchoolRecordValid returned a validation error', async () => {
      const validationError1 = new ValidationError()
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(validationError1)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      const validationError2 = new ValidationError()
      validationError2.addError('dfeNumber', 'error')
      jest.spyOn(schoolImpersonationValidator, 'isSchoolRecordValid').mockReturnValue(validationError2)
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
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
    test('detects and trims leading spaces in the dfeNumber', async () => {
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(new ValidationError())
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      jest.spyOn(schoolAuditDataService, 'auditImpersonation').mockImplementation()
      const user = {}
      const dfeNumber = ' 1230000'
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
    })
    test('detects and trims trailing spaces in the dfeNumber', async () => {
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(new ValidationError())
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      jest.spyOn(schoolAuditDataService, 'auditImpersonation').mockImplementation()
      const user = {}
      const dfeNumber = '1230000 '
      await schoolImpersonationService.setSchoolImpersonation(user, dfeNumber)
      expect(schoolImpersonationValidator.isDfeNumberValid).toHaveBeenCalledWith('1230000')
    })
    test('detects and removes non digits within the dfe number', async () => {
      jest.spyOn(schoolImpersonationValidator, 'isDfeNumberValid').mockReturnValue(new ValidationError())
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ dfeNumber: '1230000', id: 1, timezone: '' })
      jest.spyOn(schoolImpersonationService, 'impersonateSchool').mockImplementation()
      jest.spyOn(schoolAuditDataService, 'auditImpersonation').mockImplementation()
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
    test('populates the user session object without school related data', () => {
      const school = { dfeNumber: 1230000, id: 1, timezone: '' }
      const user = { role: 'helpdesk' }
      schoolImpersonationService.impersonateSchool(user, school)
      expect(user).toEqual({ School: 1230000, schoolId: 1, timezone: '', role: 'helpdesk' })
    })
  })

  describe('removeImpersonation', () => {
    test('returns the user session object without school related data', () => {
      const user = { School: '1230000', schoolId: 1, timezone: '', role: 'helpdesk' }
      schoolImpersonationService.removeImpersonation(user)
      expect(user).toEqual({ role: 'helpdesk' })
    })
  })
})
