'use strict'

/* global describe, it, expect */

const csvValidator = require('../../../lib/validator/csv-validator')

describe('CSV validator', function () {
  let headers
  let dataSet
  describe('received valid data and', function () {
    it('allows a valid request', async function (done) {
      headers = [ 'Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN' ]
      dataSet = [ [ 'Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001' ],
        [ 'Brown', 'Maria', 'Stella', 'X822200014002', '7/15/2005', 'F' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(false)
      done()
    })
  })
  describe('received invalid data and', function () {
    it('detected invalid header', async function (done) {
      headers = []
      dataSet = [ [ 'Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001' ],
        [ 'Brown', 'Maria', 'Stella', 'X822200014002', '7/15/2005', 'F' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe('Ensure columns have the same headings and order as the template')
      done()
    })
    it('detected invalid header and invalid column number on a row', async function (done) {
      headers = [ 'Surname', 'Forename', 'Middle name(s)', 'UPN', 'Date of Birth',
        'Gender' ]
      dataSet = [ [ 'Smith', 'John', 'Lawrence', 'X822200014001', 'M' ],
        [ 'Brown', 'Maria', 'Stella', 'X822200014002' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe('Ensure columns have the same headings and order as the template')
      expect(validationError.get('template-upload')[1]).toBe('Rows must contain exactly 5 commas / 6 columns')
      done()
    })
    it('detected duplicate UPN on the input data', async function (done) {
      headers = [ 'Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN' ]
      dataSet = [ [ 'Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001' ],
        [ 'Brown', 'Maria', 'Stella', '7/15/2005', 'F', 'X822200014001' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe('Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.')
      done()
    })
    it('detected only one data row', async function (done) {
      headers = [ 'Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN' ]
      dataSet = [ [ 'Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe('Must contain at least two rows of data')
      done()
    })
    it('detected a dataset which exceeds allowed max rows', async function (done) {
      headers = [ 'Surname', 'Forename', 'Middle name(s)', 'Date of birth', 'Gender', 'UPN' ]
      dataSet = [ [ 'Smith', 'John', 'Lawrence', '5/22/1005', 'M', 'X822200014001' ] ]
      for (let i = 0; i <= 301; i++) {
        dataSet.push(dataSet[0])
      }
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe('Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.')
      done()
    })
  })
})
