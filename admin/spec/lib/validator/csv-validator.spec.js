'use strict'

/* global describe, it, expect */

const csvValidator = require('../../../lib/validator/csv-validator')

describe('CSV validator', function () {
  let headers
  let dataSet
  describe('received valid data and', function () {
    it('allows a valid request', async function (done) {
      headers = [ 'First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Gender' ]
      dataSet = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ],
        [ 'Maria', 'Stella', 'Brown', 'X822200014002', '7/15/2005', 'F' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(false)
      done()
    })
  })
  describe('received invalid data and', function () {
    it('detected invalid header', async function (done) {
      headers = []
      dataSet = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ],
        [ 'Maria', 'Stella', 'Brown', 'X822200014002', '7/15/2005', 'F' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe('Ensure columns have the same headings and order as the template')
      done()
    })
    it('detected invalid header and invalid column number on a row', async function (done) {
      headers = [ 'First name', 'Middle name(s)', 'Last name', 'UPNS', 'Date of Birth',
        'Gender' ]
      dataSet = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ],
        [ 'Maria', 'Stella', 'Brown', 'X822200014002' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0]).toBe('Ensure columns have the same headings and order as the template')
      expect(validationError.get('template-upload')[1]).toBe('File rejected. The file must contain exactly 6 columns')
      done()
    })
    it('detected duplicate UPN on the input data', async function (done) {
      headers = [ 'First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Gender' ]
      dataSet = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ],
        [ 'Maria', 'Stella', 'Brown', 'X822200014001', '7/15/2005', 'F' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe('Enter a valid UPN. This one is a duplicate of another UPN in the spreadsheet.')
      done()
    })
    it('detected only one data row', async function (done) {
      headers = [ 'First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Gender' ]
      dataSet = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ] ]
      const validationError = await csvValidator.validate(dataSet, headers, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.get('template-upload')[0])
        .toBe('File rejected. If adding only 1 pupil please add pupil individually')
      done()
    })
  })
})
