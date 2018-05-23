'use strict'
/* global spyOn, describe, it, expect, fail */

const pupilCensusService = require('../../services/pupil-census.service')
const pupilCensusDataService = require('../../services/data-access/pupil-census.data.service')
const jobStatusDataService = require('../../services/data-access/job-status.data.service')
const azureFileDataService = require('../../services/data-access/azure-file.data.service')

const pupilCensusUploadMock = {
  'uuid': 'bfa9ab1b-88ae-46f2-a4ff-726c0567e37c',
  'field': 'csvPupilCensusFile',
  'file': 'spec/files/Pupil-Census-Data.csv',
  'filename': 'Pupil-Census-Data.csv',
  'encoding': '7bit',
  'mimetype': 'text/csv',
  'truncated': false,
  'done': true
}

const pupilCensusMock = {
  id: 1,
  jobStatusCode: 'SUB',
  isDeleted: 0
}

const jobStatusMock = {
  id: 1,
  description: 'Submitted',
  code: 'SUB'
}

describe('pupilCensusService', () => {
  describe('upload', () => {
    it('calls uploadToBlobStorage when reading is done', async () => {
      spyOn(pupilCensusService, 'uploadToBlobStorage')
      spyOn(pupilCensusService, 'create')
      await pupilCensusService.upload(pupilCensusUploadMock)
      expect(pupilCensusService.uploadToBlobStorage).toHaveBeenCalled()
      expect(pupilCensusService.create).toHaveBeenCalled()
    })
    it('rejects if uploadToBlobStorage fails', async () => {
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(new Error('Mock error')))
      spyOn(pupilCensusService, 'uploadToBlobStorage').and.returnValue(rejection)
      spyOn(pupilCensusService, 'create')
      try {
        await pupilCensusService.upload(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('Mock error')
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
  describe('getUploadedFile', () => {
    it('fetches a pupil census record and related status', async () => {
      spyOn(pupilCensusDataService, 'sqlFindOne').and.returnValue(pupilCensusMock)
      spyOn(jobStatusDataService, 'sqlFindOneByCode').and.returnValue(jobStatusMock)
      await pupilCensusService.getUploadedFile()
      expect(pupilCensusDataService.sqlFindOne).toHaveBeenCalled()
    })
    it('returns if no pupil census record is found', async () => {
      spyOn(pupilCensusDataService, 'sqlFindOne')
      spyOn(jobStatusDataService, 'sqlFindOneByCode')
      await pupilCensusService.getUploadedFile()
      expect(pupilCensusDataService.sqlFindOne).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByCode).not.toHaveBeenCalled()
    })
    it('throws an error pupil census record does not have a job status code', async () => {
      const errorPupilCensusMock = Object.assign({}, pupilCensusMock)
      errorPupilCensusMock.jobStatusCode = undefined
      spyOn(pupilCensusDataService, 'sqlFindOne').and.returnValue(errorPupilCensusMock)
      spyOn(jobStatusDataService, 'sqlFindOneByCode')
      try {
        await pupilCensusService.getUploadedFile()
        fail()
      }
      catch (error) {
        expect(error.message).toBe('Pupil census record does not have a job status reference')
      }
      expect(pupilCensusDataService.sqlFindOne).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByCode).not.toHaveBeenCalled()
    })
  })
  describe('create', () => {
    it('calls sqlCreate method to create the pupil census record', async () => {
      spyOn(pupilCensusDataService, 'sqlCreate')
      const blobResultMock = { name: 'blobFile' }
      await pupilCensusService.create(pupilCensusMock, blobResultMock)
      expect(pupilCensusDataService.sqlCreate).toHaveBeenCalled()
    })
  })
})
