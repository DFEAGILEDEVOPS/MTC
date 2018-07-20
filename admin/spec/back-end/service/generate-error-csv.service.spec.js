'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const azureFileDataService = require('../../../services/data-access/azure-file.data.service')

describe('generate-error-csv.service', () => {
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('generate', () => {
    beforeEach(() => {
      sandbox.mock(azureFileDataService).expects('azureUploadFile').resolves({ name: 'test' })
      proxyquire('../../../services/generate-error-csv.service', {
        '../../../services/data-access/azure-file.data.service': azureFileDataService
      })
    })

    it('returns a file object with a name attribute if the request was valid', async (done) => {
      const school = { _id: '001' }
      const headers = [ 'First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Gender' ]
      const csvData = [ [ 'John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M' ],
        [ 'Maria', 'Stella', 'Brown', 'X822200014002', '7/15/2005', 'F' ] ]
      const { file } = await generateErrorCSVService.generate(school, headers, csvData)
      expect(file).toBeDefined()
      expect(file.name).toBe('test')
      done()
    })
  })
})
