'use strict'
/* global spyOn, describe, it, expect, fail */

const pupilCensusService = require('../../services/pupil-census.service')
const pupilCensusProcessingService = require('../../services/pupil-census-processing.service')
const jobDataService = require('../../services/data-access/job.data.service')
const jobStatusDataService = require('../../services/data-access/job-status.data.service')
const jobTypeDataService = require('../../services/data-access/job-type.data.service')
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
  jobInput: JSON.stringify(['csv', 'blob'].join(',')),
  jobType_id: 1,
  jobStatus_id: 1
}

const jobStatusMock = {
  id: 1,
  description: 'Submitted',
  jobStatusCode: 'SUB'
}

const jobTypeMock = {
  id: 1,
  description: 'Pupil Census',
  jobTypeCode: 'CEN'
}

describe('pupilCensusService', () => {
  describe('upload', () => {
    it('calls uploadToBlobStorage when reading is done', async () => {
      spyOn(pupilCensusService, 'uploadToBlobStorage')
      spyOn(pupilCensusProcessingService, 'process')
      spyOn(pupilCensusService, 'create')
      await pupilCensusService.upload(pupilCensusUploadMock)
      expect(pupilCensusService.uploadToBlobStorage).toHaveBeenCalled()
      expect(pupilCensusProcessingService.process).toHaveBeenCalled()
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
      spyOn(jobDataService, 'sqlFindLatestByTypeId').and.returnValue(pupilCensusMock)
      spyOn(jobStatusDataService, 'sqlFindOneById').and.returnValue(jobStatusMock)
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneById).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    it('returns if no pupil census record is found', async () => {
      spyOn(jobDataService, 'sqlFindLatestByTypeId')
      spyOn(jobStatusDataService, 'sqlFindOneById')
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneById).not.toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    it('throws an error pupil census record does not have a job status code', async () => {
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      const errorPupilCensusMock = Object.assign({}, pupilCensusMock)
      errorPupilCensusMock.jobStatus_id = undefined
      spyOn(jobDataService, 'sqlFindLatestByTypeId').and.returnValue(errorPupilCensusMock)
      spyOn(jobStatusDataService, 'sqlFindOneById')
      try {
        await pupilCensusService.getUploadedFile()
        fail()
      } catch (error) {
        expect(error.message).toBe('Pupil census record does not have a job status reference')
      }
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneById).not.toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
  })
  describe('create', () => {
    it('calls sqlCreate method to create the pupil census record', async () => {
      spyOn(jobDataService, 'sqlCreate')
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').and.returnValue(jobStatusMock)
      const blobResultMock = { name: 'blobFile' }
      await pupilCensusService.create(pupilCensusMock, blobResultMock, { output: 'Inserted 5000 rows' })
      expect(jobDataService.sqlCreate).toHaveBeenCalled()
    })
  })
})
