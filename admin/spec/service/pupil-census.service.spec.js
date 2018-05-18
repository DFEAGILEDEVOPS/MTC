'use strict'
/* global spyOn, describe, it, expect, fail */

const pupilCensusService = require('../../services/pupil-census.service')
const azureFileDataService = require('../../services/data-access/azure-file.data.service')

const pupilCensusMock = {
  'uuid': 'bfa9ab1b-88ae-46f2-a4ff-726c0567e37c',
  'field': 'csvPupilCensusFile',
  'file': 'spec/files/Pupil-Census-Data.csv',
  'filename': 'Pupil-Census-Data.csv',
  'encoding': '7bit',
  'mimetype': 'text/csv',
  'truncated': false,
  'done': true
}

describe('pupilCensusService', () => {
  describe('upload', () => {
    it('calls uploadToBlobStorage when reading is done', async () => {
      spyOn(pupilCensusService, 'uploadToBlobStorage')
      await pupilCensusService.upload(pupilCensusMock)
      expect(pupilCensusService.uploadToBlobStorage).toHaveBeenCalled()
    })
    xit('rejects if uploadToBlobStorage fails', async () => {
      spyOn(pupilCensusService, 'uploadToBlobStorage').and.returnValue(Promise.reject(new Error('error')))
      try {
        await pupilCensusService.upload(pupilCensusMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
    })
  })
  describe('uploadToBlobStorage', () => {
    it('calls azureUploadFile method to upload the file', async () => {
      spyOn(azureFileDataService, 'azureUploadFile')
      await pupilCensusService.uploadToBlobStorage([])
      expect(azureFileDataService.azureUploadFile).toHaveBeenCalled()
    })
  })
})
