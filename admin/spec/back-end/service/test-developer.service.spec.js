'use strict'

const fs = require('fs-extra')

const sut = require('../../../services/test-developer.service')
const checkFormPresenter = require('../../../helpers/check-form-presenter')
const checkFormV2DataService = require('../../../services/data-access/check-form-v2.data.service')
const checkFormsValidator = require('../../../lib/validator/check-form/check-forms-validator')
const ValidationError = require('../../../lib/validation-error')
const redisCacheService = require('../../../services/data-access/redis-cache.service')

describe('test-developer.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('saveCheckForms', () => {
    let uploadData
    let requestData
    beforeEach(() => {
      jest.spyOn(sut, 'prepareSubmissionData').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlInsertCheckForms').mockImplementation()
      uploadData = { filename: 'filename' }
      requestData = { checkFormType: 'L' }
    })
    test('calls prepareData and sqlInsertCheckForms when no validation error is detected', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindAllCheckForms').mockResolvedValue([])
      jest.spyOn(checkFormsValidator, 'validate').mockResolvedValue(new ValidationError())
      await expect(sut.saveCheckForms(uploadData, requestData)).resolves.not.toThrow()
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(sut.prepareSubmissionData).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).toHaveBeenCalled()
    })

    test('does not call prepareData and sqlInsertCheckForms when validation error is detected', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindAllCheckForms').mockResolvedValue([])
      const validationError = new ValidationError()
      validationError.addError('csvFile', 'error')
      jest.spyOn(checkFormsValidator, 'validate').mockResolvedValue(validationError)
      await expect(sut.saveCheckForms(uploadData, requestData)).rejects.toBeInstanceOf(ValidationError)
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(sut.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).not.toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    test('reads valid csv and extracts submission data', async () => {
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
    test('finds a familiarisation check form and returns true to indicate it exists', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').mockResolvedValue({ id: 1 })
      const result = await sut.hasExistingFamiliarisationCheckForm()
      expect(result).toBeTruthy()
    })
    test('finds a familiarisation check form and returns true to indicate it exists', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindFamiliarisationCheckForm').mockResolvedValue({})
      const result = await sut.hasExistingFamiliarisationCheckForm()
      expect(result).toBeFalsy()
    })
  })
  describe('getSavedForms', () => {
    test('find non deleted check forms and converts the data for the presentation layer ', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindActiveCheckForms').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationListData').mockImplementation()
      await sut.getSavedForms()
      expect(checkFormV2DataService.sqlFindActiveCheckForms).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationListData).toHaveBeenCalled()
    })
  })
  describe('getCheckFormName', () => {
    test('fetches the name of the check form based on urlSlug provided', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug').mockResolvedValue({ id: 1, name: 'name' })
      const result = await sut.getCheckFormName()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(result).toBe('name')
    })
  })
  describe('getCheckForm', () => {
    test('fetches view single check form data for the presentation layer ', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormByUrlSlug').mockImplementation()
      jest.spyOn(checkFormPresenter, 'getPresentationCheckFormData').mockImplementation()
      await sut.getCheckForm()
      expect(checkFormV2DataService.sqlFindCheckFormByUrlSlug).toHaveBeenCalled()
      expect(checkFormPresenter.getPresentationCheckFormData).toHaveBeenCalled()
    })
  })
  describe('getCheckFormsByType', () => {
    test('calls check forms for live check form type', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindActiveCheckFormsByType').mockImplementation()
      await sut.getCheckFormsByType('live')
      const isLiveCheckForm = true
      expect(checkFormV2DataService.sqlFindActiveCheckFormsByType).toHaveBeenCalledWith(isLiveCheckForm)
    })
    test('calls check forms for familiarisation check form type', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindActiveCheckFormsByType').mockImplementation()
      await sut.getCheckFormsByType('familiarisation')
      const isLiveCheckForm = false
      expect(checkFormV2DataService.sqlFindActiveCheckFormsByType).toHaveBeenCalledWith(isLiveCheckForm)
    })
  })
  describe('getCheckFormsByCheckWindowIdAndType', () => {
    test('fetches check forms based on check window and live check form type', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType').mockImplementation()
      const checkWindow = { id: 1 }
      await sut.getCheckFormsByCheckWindowIdAndType(checkWindow, 'live')
      const isLiveCheckForm = true
      expect(checkFormV2DataService.sqlFindCheckFormsByCheckWindowIdAndType).toHaveBeenCalledWith(1, isLiveCheckForm)
    })
    test('fetches check forms based on check window and familiarisation check form type', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByCheckWindowIdAndType').mockImplementation()
      const checkWindow = { id: 1 }
      await sut.getCheckFormsByCheckWindowIdAndType(checkWindow, 'familiarisation')
      const isLiveCheckForm = false
      expect(checkFormV2DataService.sqlFindCheckFormsByCheckWindowIdAndType).toHaveBeenCalledWith(1, isLiveCheckForm)
    })
  })
  describe('updateCheckWindowForms', () => {
    test('fetches check window, check form records and assigns forms to check window', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockResolvedValue([{ id: 1 }])
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).toHaveBeenCalled()
    })
    test('returns an error if no check window is found', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const checkWindow = {}
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await expect(sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)).rejects.toThrow('Check window not found')
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    test('returns an error if no check forms are found', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockResolvedValue([])
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await expect(sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)).rejects.toHaveProperty('message', 'Check forms not found with url slugs urlSlug1,urlSlug2')
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    test('returns an error if no fetching check forms call fails', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockRejectedValue(new Error('error'))
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await expect(sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)).rejects.toThrow('error')
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).not.toHaveBeenCalled()
    })
    test('returns an error if no assigning check forms call fails', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockResolvedValue([{ id: 1 }])
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockRejectedValue(new Error('error'))
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      const checkWindow = { id: 1, urlSlug: 'urlSlug' }
      const checkFormType = 'live'
      const checkFormUrlSlugs = ['urlSlug1', 'urlSlug2']
      await expect(sut.updateCheckWindowForms(checkWindow, checkFormType, checkFormUrlSlugs)).rejects.toThrow('error')
      expect(checkFormV2DataService.sqlFindCheckFormsByUrlSlugs).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlUnassignFamiliarisationForm).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlAssignFormsToCheckWindow).toHaveBeenCalled()
    })
    test('calls sqlUnassignFamiliarisationForm if no check forms are passed in familiarisation type', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckFormsByUrlSlugs').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlUnassignFamiliarisationForm').mockImplementation()
      jest.spyOn(checkFormV2DataService, 'sqlAssignFormsToCheckWindow').mockImplementation()
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
    test('returns true if a familiarisation form is assigned to the check window', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').mockResolvedValue({ id: 1 })
      const checkWindow = { id: 1 }
      await expect(sut.hasAssignedFamiliarisationForm(checkWindow)).resolves.toBeTruthy()
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).toHaveBeenCalled()
    })
    test('returns false if a familiarisation form is not assigned to the check window', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').mockResolvedValue({})
      const checkWindow = { id: 1 }
      await expect(sut.hasAssignedFamiliarisationForm(checkWindow)).resolves.toBeFalsy()
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).toHaveBeenCalled()
    })
    test('throws an error if check window is not found', async () => {
      jest.spyOn(checkFormV2DataService, 'sqlFindCheckWindowFamiliarisationCheckForm').mockResolvedValue({})
      const checkWindow = {}
      await expect(sut.hasAssignedFamiliarisationForm(checkWindow)).rejects.toThrow('Check window not found')
      expect(checkFormV2DataService.sqlFindCheckWindowFamiliarisationCheckForm).not.toHaveBeenCalled()
    })
  })
})
