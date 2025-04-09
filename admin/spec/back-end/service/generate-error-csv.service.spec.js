'use strict'

const generateErrorCSVService = require('../../../services/generate-error-csv.service')
const azureBlobDataService = require('../../../services/data-access/azure-blob.data.service')

describe('generate-error-csv.service', () => {
  describe('generate', () => {
    beforeEach(() => {
      jest.spyOn(azureBlobDataService, 'uploadData').mockImplementation()
    })

    test('returns a file object with a name attribute if the request was valid', async () => {
      const school = { id: '001' }
      const headers = ['First name', 'Middle name(s)', 'Last name', 'UPN', 'Date of Birth',
        'Sex']
      const csvData = [['John', 'Lawrence', 'Smith', 'X822200014001', '5/22/1005', 'M'],
        ['Maria', 'Stella', 'Brown', 'X822200014002', '7/15/2005', 'F']]
      try {
        const response = await generateErrorCSVService.generate(school, headers, csvData)
        expect(response).toBeDefined()
        expect(response.remoteFilename.startsWith('001_')).toBe(true)
      } catch (error) {
        fail(error)
      }
    })
  })
})
