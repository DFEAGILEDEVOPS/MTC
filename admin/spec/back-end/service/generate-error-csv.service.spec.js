'use strict'
/* global describe, beforeEach, spyOn, it, expect fail */

const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const azureFileDataService = require('../../../services/data-access/azure-file.data.service')

describe('generate-error-csv.service', () => {
  describe('generate', () => {
    beforeEach(() => {
      spyOn(azureFileDataService, 'azureUploadFile').and.returnValue({ name: 'test' })
    })

    it('returns a file object with a name attribute if the request was valid', async () => {
      const school = { _id: '001' }
      const headers = ['First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Gender']
      const csvData = [['John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M'],
        ['Maria', 'Stella', 'Brown', 'X822200014002', '7/15/2005', 'F']]
      try {
        const { file } = await generateErrorCSVService.generate(school, headers, csvData)
        expect(file).toBeDefined()
        expect(file.name).toBe('test')
      } catch (error) {
        fail('call failed')
      }
    })
  })
})
