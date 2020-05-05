'use strict'
/* global describe, it, expect, spyOn beforeEach fail */
const fs = require('fs-extra')

const sut = require('../../../services/test-developer.service')
const checkFormPresenter = require('../../../helpers/check-form-presenter')
const checkFormV2DataService = require('../../../services/data-access/check-form-v2.data.service')
const checkFormsValidator = require('../../../lib/validator/check-form/check-forms-validator')
const ValidationError = require('../../../lib/validation-error')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

describe('test-developer.service', () => {
  describe('saveCheckForms', () => {
    let uploadData
    let requestData
    beforeEach(() => {
      spyOn(sut, 'prepareSubmissionData')
      spyOn(checkFormV2DataService, 'sqlInsertCheckForms')
      uploadData = { filename: 'filename' }
      requestData = { checkFormType: 'L' }
    })
    it('calls prepareData and sqlInsertCheckForms when no validation error is detected', async () => {
      spyOn(checkFormV2DataService, 'sqlFindAllCheckForms').and.returnValue([])
      spyOn(checkFormsValidator, 'validate').and.returnValue(new ValidationError())
      try {
        await sut.saveCheckForms(uploadData, requestData)
      } catch (error) {
        fail()
      }
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(sut.prepareSubmissionData).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).toHaveBeenCalled()
    })
    it('does not call prepareData and sqlInsertCheckForms when validation error is detected', async () => {
      spyOn(checkFormV2DataService, 'sqlFindAllCheckForms').and.returnValue([])
      const validationError = new ValidationError()
      validationError.addError('csvFile', 'error')
      spyOn(checkFormsValidator, 'validate').and.returnValue(validationError)
      try {
        await sut.saveCheckForms(uploadData, requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(sut.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).not.toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    it('reads valid csv and extracts submission data', async () => {
      const fileDir = 'spec/back-end/mocks/check-forms/check-form-valid.csv'
      const checkFormType = 'L'
      const uploadedFiles = [
        {
          filename: 'filename1',
          file: fileDir
        }
      ]
      const fileData = fs.readFileSync(fileDir, 'utf8')
      const rows = fileData.split('\n')
      const dataRows = rows.map(r => r.split(','))
      const formData = []
      dataRows.forEach(dataRow => {
        const question = {}
        question.f1 = parseInt(dataRow[0], 10)
        question.f2 = parseInt(dataRow[1], 10)
        formData.push(question)
      })
      const submissionData = await sut.prepareSubmissionData(uploadedFiles, checkFormType)
      expect(submissionData).toBeDefined()
      expect(submissionData[0].name).toBe('filename1')
      expect(submissionData[0].isLiveCheckForm).toBe(1)
      expect(submissionData[0].formData).toEqual(JSON.stringify(formData))
    })
  })
  describe('hasExistingFamiliarisationCheckForm', () => {
    it('finds a familiarisation check form and returns true to indicate it exists', async () => {
      spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').and.returnValue({ id: 1 })
      const result = await sut.hasExistingFamiliarisationCheckForm()
      expect(result).toBeTruthy()
    })
    it('finds a familiarisation check form and returns true to indicate it exists', async () => {
      spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').and.returnValue({})
      const result = await sut.hasExistingFamiliarisationCheckForm()
      expect(result).toBeFalsy()
    })
  })
  describe('getSavedForms', () => {
    it('find non deleted check forms and converts the data for the presentation layer ', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckForms')
      spyOn(checkFormPresenter, 'getPresentationListData')
      await sut.getSavedForms()
      expect(checkFormV2DataService.sqlFindActiveCheckForms).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationListData).toHaveBeenCalled()
    })
  })
  describe('getCheckFormName', () => {
    it('fetches the name of the check form based on urlSlug provided', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug').and.returnValue({ id: 1, name: 'name' })
      const result = await sut.getCheckFormName()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(result).toBe('name')
    })
  })
  describe('getCheckForm', () => {
    it('fetches view single check form data for the presentation layer ', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug')
      spyOn(checkFormPresenter, 'getPresentationCheckFormData')
      await sut.getCheckForm()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckFormData).toHaveBeenCalled()
    })
  })
  describe('getCheckFormsByType', () => {
    it('calls check forms for live check form type', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckFormsByType')
      await sut.getCheckFormsByType('live')
      const isLiveCheckForm = true
      expect(checkFormV2DataService.sqlFindActiveCheckFormsByType).toHaveBeenCalledWith(isLiveCheckForm)
    })
    it('calls check forms for familiarisation check form type', async () => {
      spyOn(checkFormV2DataService, 'sqlFindActiveCheckFormsByType')
      await sut.getCheckFormsByType('familiarisation')
      const isLiveCheckForm = false
      expect(checkFormV2DataService.sqlFindActiveCheckFormsByType).toHaveBeenCalledWith(isLiveCheckForm)
    })
  })
  describe('getCheckFormsByCheckWindowIdAndType', () => {
    it('fetches check forms based on check window and live check form type', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType')
      const checkWindow = { id: 1 }
      await sut.getCheckFormsByCheckWindowIdAndType(checkWindow, 'live')
      const isLiveCheckForm = true
      expect(checkFormV2DataService.sqlFindCheckFormsByCheckWindowIdAndType).toHaveBeenCalledWith(1, isLiveCheckForm)
    })
    it('fetches check forms based on check window and familiarisation check form type', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType')
      const checkWindow = { id: 1 }
      await sut.getCheckFormsByCheckWindowIdAndType(checkWindow, 'familiarisation')
      const isLiveCheckForm = false
      expect(checkFormV2DataService.sqlFindCheckFormsByCheckWindowIdAndType).toHaveBeenCalledWith(1, isLiveCheckForm)
    })
  })
  describe('updateCheckWindowForms', () => {
    it('fetches check window, check form records and assigns forms to check window', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').and.returnValue([{ id: 1 }])
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow')
      spyOn(redisCacheService, 'drop').and.returnValue(Promise.resolve())
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).toHaveBeenCalled()
    })
    it('returns an error if no check window is found', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs')
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow')
      spyOn(redisCacheService, 'drop').and.returnValue(Promise.resolve())
      const checkWindow = {}
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      try {
        await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
        fail()
      } catch (error) {
        expect(error.message).toBe('Check window not found')
      }
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    it('returns an error if no check forms are found', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').and.returnValue([])
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow')
      spyOn(redisCacheService, 'drop').and.returnValue(Promise.resolve())
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      try {
        await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
        fail()
      } catch (error) {
        expect(error.message).toBe('Check forms not found with url slugs urlSlug1,urlSlug2')
      }
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    it('returns an error if no fetching check forms call fails', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').and.returnValue(Promise.reject(new Error('error')))
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow')
      spyOn(redisCacheService, 'drop').and.returnValue(Promise.resolve())
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      try {
        await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    it('returns an error if no assigning check forms call fails', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').and.returnValue([{ id: 1 }])
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').and.returnValue(Promise.reject(new Error('error')))
      spyOn(redisCacheService, 'drop').and.returnValue(Promise.resolve())
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      try {
        await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).toHaveBeenCalled()
    })
    it('calls sqlUnassignFamiliarisationForm if no check forms are passed in familiarisation type', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs')
      spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm')
      spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow')
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'familiarisation'
      const checkFormUrlSlugs = undefined
      await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
  })
  describe('hasAssignedFamiliarisationForm', () => {
    it('returns true if a familiarisation form is assigned to the check window', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').and.returnValue({ id: 1 })
      const checkWindow = { id: 1 }
      let result
      try {
        result = await sut.hasAssignedFamiliarisationForm(checkWindow)
      } catch (error) {
        fail()
      }
      expect(result).toBeTruthy()
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).toHaveBeenCalled()
    })
    it('returns false if a familiarisation form is not assigned to the check window', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').and.returnValue({})
      const checkWindow = { id: 1 }
      let result
      try {
        result = await sut.hasAssignedFamiliarisationForm(checkWindow)
      } catch (error) {
        fail()
      }
      expect(result).toBeFalsy()
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).toHaveBeenCalled()
    })
    it('throws an error if check window is not found', async () => {
      spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').and.returnValue({})
      const checkWindow = {}
      try {
        await sut.hasAssignedFamiliarisationForm(checkWindow)
        fail()
      } catch (error) {
        expect(error.message).toEqual('Check window not found')
      }
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).not.toHaveBeenCalled()
    })
  })
})
