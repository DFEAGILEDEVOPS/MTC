'use strict'
/* global describe, it, expect, spyOn beforeEach fail */
const fs = require('fs-extra')

const checkFormV2DataService = require('../../../services/data-access/check-form-v2.data.service')
const checkFormV2Service = require('../../../services/check-form-v2.service')
const checkFormsValidator = require('../../../lib/validator/check-form/check-forms-validator')
const ValidationError = require('../../../lib/validation-error')

describe('check-form-v2.service', () => {
  describe('processData', () => {
    let uploadData
    let requestData
    beforeEach(() => {
      spyOn(checkFormV2DataService, 'sqlFindAllCheckForms')
      spyOn(checkFormV2Service, 'prepareSubmissionData')
      spyOn(checkFormV2DataService, 'sqlInsertCheckForms')
      uploadData = { filename: 'filename' }
      requestData = { checkFormType: 'L' }
    })
    it('calls prepareData and sqlInsertCheckForms when no validation error is detected', async () => {
      spyOn(checkFormsValidator, 'validate').and.returnValue(new ValidationError())
      try {
        await checkFormV2Service.processData(uploadData, requestData)
      } catch (error) {
        fail()
      }
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(checkFormV2Service.prepareSubmissionData).toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).toHaveBeenCalled()
    })
    it('does not call prepareData and sqlInsertCheckForms when validation error is detected', async () => {
      const validationError = new ValidationError()
      validationError.addError('csvFile', 'error')
      spyOn(checkFormsValidator, 'validate').and.returnValue(validationError)
      try {
        await checkFormV2Service.processData(uploadData, requestData)
        fail()
      } catch (error) {
        expect(error.name).toBe('ValidationError')
      }
      expect(checkFormV2DataService.sqlFindAllCheckForms).toHaveBeenCalled()
      expect(checkFormsValidator.validate).toHaveBeenCalled()
      expect(checkFormV2Service.prepareSubmissionData).not.toHaveBeenCalled()
      expect(checkFormV2DataService.sqlInsertCheckForms).not.toHaveBeenCalled()
    })
  })
  describe('prepareSubmissionData', () => {
    it('reads valid csv and extracts submission data', async () => {
      const fileDir = 'spec/back-end/mocks/check-forms/check-form-valid.csv'
      const requestData = { checkFormType: 'L' }
      const uploadedFiles = [
        {
          filename: 'filename1',
          file: fileDir
        }
      ]
      const fileData = fs.readFileSync(fileDir, 'utf8')
      const rows = fileData.split('\n')
      rows.splice(-1, 1)
      const dataRows = rows.map(r => r.split(','))
      const formData = []
      dataRows.forEach(dataRow => {
        const question = {}
        question.f1 = parseInt(dataRow[0], 10)
        question.f2 = parseInt(dataRow[1], 10)
        formData.push(question)
      })
      const submissionData = await checkFormV2Service.prepareSubmissionData(uploadedFiles, requestData)
      expect(submissionData).toBeDefined()
      expect(submissionData[0].name).toBe('filename1')
      expect(submissionData[0].isLiveCheckForm).toBe(1)
      expect(submissionData[0].formData).toEqual(JSON.stringify(formData))
    })
  })
})
