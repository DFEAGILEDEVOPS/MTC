'use strict'
/* global spyOn, describe, it, expect, fail */

const pupilCensusService = require('../../../services/pupil-census.service')
const pupilCensusProcessingService = require('../../../services/pupil-census-processing.service')
const jobDataService = require('../../../services/data-access/job.data.service')
const jobStatusDataService = require('../../../services/data-access/job-status.data.service')
const jobTypeDataService = require('../../../services/data-access/job-type.data.service')
const pupilCensusDataService = require('../../../services/data-access/pupil-census.data.service')
const fileValidator = require('../../../lib/validator/file-validator.js')
const azureBlobDataService = require('../../../services/data-access/azure-blob.data.service')

const pupilCensusUploadMock = {
  uuid: 'bfa9ab1b-88ae-46f2-a4ff-726c0567e37c',
  field: 'csvPupilCensusFile',
  file: 'spec/back-end/files/Pupil-Census-Data.csv',
  filename: 'Pupil-Census-Data.csv',
  encoding: '7bit',
  mimetype: 'text/csv',
  truncated: false,
  done: true
}

const pupilCensusMock = {
  id: 1,
  jobInput: 'csv',
  jobType_id: 1,
  jobStatus_id: 1,
  jobStatusDescription: 'Submitted',
  jobStatusCode: 'SUB'
}

const jobStatusSubmittedMock = {
  id: 1,
  description: 'Submitted',
  jobStatusCode: 'SUB'
}

const jobStatusDeletedMock = {
  id: 1,
  description: 'Deleted',
  jobStatusCode: 'DEL'
}

const jobTypeMock = {
  id: 1,
  description: 'Pupil Census',
  jobTypeCode: 'CEN'
}

describe('pupilCensusService', () => {
  describe('process', () => {
    it('calls file validator', async () => {
      spyOn(fileValidator, 'validate')
      await pupilCensusService.process(pupilCensusUploadMock)
      expect(fileValidator.validate).toHaveBeenCalled()
    })
  })
  describe('upload', () => {
    it('calls create then processes the data and finally calls update', async () => {
      spyOn(pupilCensusProcessingService, 'process').and.returnValue({ output: 'output' })
      spyOn(pupilCensusService, 'create').and.returnValue({ insertId: 1 })
      spyOn(pupilCensusService, 'updateJobOutput')
      await pupilCensusService.upload(pupilCensusUploadMock)
      expect(pupilCensusProcessingService.process).toHaveBeenCalled()
      expect(pupilCensusService.create).toHaveBeenCalled()
      expect(pupilCensusService.updateJobOutput).toHaveBeenCalled()
    })
    it('throws an error if create does not return insertId', async () => {
      spyOn(pupilCensusProcessingService, 'process')
      spyOn(pupilCensusService, 'create').and.returnValue({})
      try {
        await pupilCensusService.upload(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('Job has not been created')
      }
      expect(pupilCensusProcessingService.process).not.toHaveBeenCalled()
      expect(pupilCensusService.create).toHaveBeenCalled()
    })
    it('throws an error if bulk process does not return submission result', async () => {
      spyOn(pupilCensusProcessingService, 'process')
      spyOn(pupilCensusService, 'create').and.returnValue({ insertId: 1 })
      spyOn(pupilCensusService, 'updateJobOutput')
      try {
        await pupilCensusService.upload(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('No result has been returned from pupil bulk insertion')
      }
      expect(pupilCensusProcessingService.process).toHaveBeenCalled()
      expect(pupilCensusService.create).toHaveBeenCalled()
      expect(pupilCensusService.updateJobOutput).not.toHaveBeenCalled()
    })
    it('rejects if process fails', async () => {
      const unsafeReject = p => {
        p.catch(ignore => ignore)
        return p
      }
      const rejection = unsafeReject(Promise.reject(new Error('Mock error')))
      spyOn(pupilCensusService, 'create').and.returnValue({ insertId: 1 })
      spyOn(pupilCensusProcessingService, 'process').and.returnValue(rejection)
      try {
        await pupilCensusService.upload(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('Mock error')
      }
    })
  })
  describe('upload2', () => {
    it('reads the file into stream, creates a job record and uploads to blob storage', async () => {
      spyOn(pupilCensusService, 'create').and.returnValue({ id: 1, urlSlug: 'urlSlug' })
      spyOn(azureBlobDataService, 'createContainerIfNotExistsAsync')
      spyOn(azureBlobDataService, 'createBlockBlobFromLocalFileAsync')
      spyOn(jobDataService, 'sqlUpdateStatus')
      await pupilCensusService.upload2(pupilCensusUploadMock)
      expect(pupilCensusService.create).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExistsAsync).toHaveBeenCalled()
      expect(azureBlobDataService.createBlockBlobFromLocalFileAsync).toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).not.toHaveBeenCalled()
    })
    it('throws error if the job creation fails', async () => {
      spyOn(pupilCensusService, 'create').and.returnValue({})
      spyOn(azureBlobDataService, 'createContainerIfNotExistsAsync')
      spyOn(azureBlobDataService, 'createBlockBlobFromLocalFileAsync')
      spyOn(jobDataService, 'sqlUpdateStatus')
      try {
        await pupilCensusService.upload2(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('Job has not been created')
      }
      expect(pupilCensusService.create).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExistsAsync).not.toHaveBeenCalled()
      expect(azureBlobDataService.createBlockBlobFromLocalFileAsync).not.toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).not.toHaveBeenCalled()
    })
    it('calls sqlUpdateStatus with failed status code if if blob uploading fails', async () => {
      const error = new Error()
      error.message = 'error'
      spyOn(pupilCensusService, 'create').and.returnValue({ id: 1, urlSlug: 'urlSlug' })
      spyOn(azureBlobDataService, 'createContainerIfNotExistsAsync')
      spyOn(azureBlobDataService, 'createBlockBlobFromLocalFileAsync').and.returnValue(Promise.reject(error))
      spyOn(jobDataService, 'sqlUpdateStatus')
      try {
        await pupilCensusService.upload2(pupilCensusUploadMock)
        fail()
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(pupilCensusService.create).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExistsAsync).toHaveBeenCalled()
      expect(azureBlobDataService.createBlockBlobFromLocalFileAsync).toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).toHaveBeenCalledWith('urlSlug', 'FLD')
    })
  })
  describe('getUploadedFile', () => {
    it('fetches a pupil census record and related status', async () => {
      spyOn(jobDataService, 'sqlFindLatestByTypeId').and.returnValue(pupilCensusMock)
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    it('returns if no pupil census record is found', async () => {
      spyOn(jobDataService, 'sqlFindLatestByTypeId')
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    it('throws an error pupil census record does not have a job status code', async () => {
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      const errorPupilCensusMock = Object.assign({}, pupilCensusMock)
      errorPupilCensusMock.jobStatusCode = undefined
      spyOn(jobDataService, 'sqlFindLatestByTypeId').and.returnValue(errorPupilCensusMock)
      try {
        await pupilCensusService.getUploadedFile()
        fail()
      } catch (error) {
        expect(error.message).toBe('Pupil census record does not have a job status reference')
      }
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
  })
  describe('create', () => {
    it('calls sqlCreate method to create the pupil census record', async () => {
      spyOn(jobDataService, 'sqlCreate')
      spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').and.returnValue(jobTypeMock)
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').and.returnValue(jobStatusSubmittedMock)
      await pupilCensusService.create(pupilCensusMock, { output: 'Inserted 5000 rows' })
      expect(jobDataService.sqlCreate).toHaveBeenCalled()
    })
  })
  describe('updateJobOutput', () => {
    it('calls sqlUpdate method to update the pupil census record', async () => {
      spyOn(jobDataService, 'sqlUpdate')
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').and.returnValue(jobStatusSubmittedMock)
      await pupilCensusService.updateJobOutput(1, { output: 'output' })
      expect(jobDataService.sqlUpdate).toHaveBeenCalled()
    })
  })
  describe('remove', () => {
    it('calls sqlUpdate method to update the pupil census record with the deleted status', async () => {
      spyOn(pupilCensusDataService, 'sqlDeletePupilsByJobId')
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').and.returnValue(jobStatusDeletedMock)
      spyOn(jobDataService, 'sqlUpdate')
      await pupilCensusService.remove(1)
      expect(pupilCensusDataService.sqlDeletePupilsByJobId).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByTypeCode).toHaveBeenCalledWith('DEL')
      expect(jobDataService.sqlUpdate).toHaveBeenCalled()
    })
    it('throws an error when argument passed is undefined', async () => {
      spyOn(pupilCensusDataService, 'sqlDeletePupilsByJobId')
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode')
      spyOn(jobDataService, 'sqlUpdate')
      try {
        await pupilCensusService.remove(undefined)
        fail()
      } catch (error) {
        expect(error.message).toBe('No pupil census id is provided for deletion')
      }
      expect(pupilCensusDataService.sqlDeletePupilsByJobId).not.toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByTypeCode).not.toHaveBeenCalledWith('DEL')
      expect(jobDataService.sqlUpdate).not.toHaveBeenCalled()
    })
  })
})
