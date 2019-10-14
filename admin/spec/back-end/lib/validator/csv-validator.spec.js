'use strict'

/* global describe, it, expect */

const csvValidator = require('../../../../lib/validator/csv-validator')
const csvPupilUploadErrors = require('../../../../lib/errors/csv-pupil-upload')

describe('CSV validator', function () {
  let headers
  let dataSet
  describe('received valid data and', function () {
    it('allows a valid request', async function (done) {
      headers = ['Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN']
      dataSet = [['Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001'],
        ['Brown', 'Maria', 'Stella', 'X822200014002', '7/15/2005', 'F']]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(false)
      done()
    })
  })
  describe('received invalid data and', function () {
    it('detected invalid header', async function (done) {
      headers = []
      dataSet = [['Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001'],
        ['Brown', 'Maria', 'Stella', 'X822200014002', '7/15/2005', 'F']]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe(csvPupilUploadErrors.invalidHeader)
      done()
    })
    it('detected invalid header and invalid column number on a row', async function (done) {
      headers = ['Surname', 'Forename', 'Middle name(s)', 'UPN', 'Date of Birth',
        'Gender']
      dataSet = [['Smith', 'John', 'Lawrence', 'X822200014001', 'M'],
        ['Brown', 'Maria', 'Stella', 'X822200014002']]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe(csvPupilUploadErrors.invalidHeader)
      expect(validationError.get('template-upload')[1]).toBe(csvPupilUploadErrors.not6Columns)
      done()
    })
    it('detected only one data row', async function (done) {
      headers = ['Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN']
      dataSet = [['Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001']]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe(csvPupilUploadErrors.hasOneRow)
      done()
    })
    it('detected a dataset which exceeds allowed max rows', async function (done) {
      headers = ['Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN']
      dataSet = [['Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001']]
      for (let i = 0; i <= 301; i++) {
        dataSet.push(dataSet[0])
      }
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe(csvPupilUploadErrors.exceedsAllowedRows)
      done()
    })
  })
})
