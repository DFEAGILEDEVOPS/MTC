'use strict'

const pupilCensusService = require('../../../services/pupil-census.service')
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
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('validateFile', () => {
    test('calls file validator', async () => {
      jest.spyOn(fileValidator, 'validate').mockImplementation()
      await pupilCensusService.validateFile(pupilCensusUploadMock)
      expect(fileValidator.validate).toHaveBeenCalled()
    })
  })

  describe('upload2', () => {
    test('reads the file into stream, creates a job record and uploads to blob storage', async () => {
      jest.spyOn(pupilCensusService, 'createJobRecord').mockResolvedValue({ id: 1, urlSlug: 'urlSlug' })
      jest.spyOn(azureBlobDataService, 'createContainerIfNotExists').mockImplementation()
      jest.spyOn(azureBlobDataService, 'uploadLocalFile').mockImplementation()
      jest.spyOn(jobDataService, 'sqlUpdateStatus').mockImplementation()
      await pupilCensusService.upload2(pupilCensusUploadMock)
      expect(pupilCensusService.createJobRecord).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExists).toHaveBeenCalled()
      expect(azureBlobDataService.uploadLocalFile).toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).not.toHaveBeenCalled()
    })
    test('throws error if the job creation fails', async () => {
      jest.spyOn(pupilCensusService, 'createJobRecord').mockResolvedValue({})
      jest.spyOn(azureBlobDataService, 'createContainerIfNotExists').mockImplementation()
      jest.spyOn(azureBlobDataService, 'uploadLocalFile').mockImplementation()
      jest.spyOn(jobDataService, 'sqlUpdateStatus').mockImplementation()
      await expect(pupilCensusService.upload2(pupilCensusUploadMock)).rejects.toThrowError('Job has not been created')
      expect(pupilCensusService.createJobRecord).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExists).not.toHaveBeenCalled()
      expect(azureBlobDataService.uploadLocalFile).not.toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).not.toHaveBeenCalled()
    })
    test('calls sqlUpdateStatus with failed status code if if blob uploading fails', async () => {
      const error = new Error()
      error.message = 'error'
      jest.spyOn(pupilCensusService, 'createJobRecord').mockResolvedValue({ id: 1, urlSlug: 'urlSlug' })
      jest.spyOn(azureBlobDataService, 'createContainerIfNotExists').mockImplementation()
      jest.spyOn(azureBlobDataService, 'uploadLocalFile').mockRejectedValue(error)
      jest.spyOn(jobDataService, 'sqlUpdateStatus').mockImplementation()
      await expect(pupilCensusService.upload2(pupilCensusUploadMock)).rejects.toThrowError('error')
      expect(pupilCensusService.createJobRecord).toHaveBeenCalled()
      expect(azureBlobDataService.createContainerIfNotExists).toHaveBeenCalled()
      expect(azureBlobDataService.uploadLocalFile).toHaveBeenCalled()
      expect(jobDataService.sqlUpdateStatus).toHaveBeenCalledWith('urlSlug', 'FLD')
    })
  })

  describe('getUploadedFile', () => {
    test('fetches a pupil census record and related status', async () => {
      jest.spyOn(jobDataService, 'sqlFindLatestByTypeId').mockResolvedValue(pupilCensusMock)
      jest.spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    test('returns if no pupil census record is found', async () => {
      jest.spyOn(jobDataService, 'sqlFindLatestByTypeId').mockImplementation()
      jest.spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobTypeMock)
      await pupilCensusService.getUploadedFile()
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
    test('throws an error pupil census record does not have a job status code', async () => {
      jest.spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobTypeMock)
      const errorPupilCensusMock = Object.assign({}, pupilCensusMock)
      errorPupilCensusMock.jobStatusCode = undefined
      jest.spyOn(jobDataService, 'sqlFindLatestByTypeId').mockResolvedValue(errorPupilCensusMock)
      await expect(pupilCensusService.getUploadedFile()).rejects.toThrowError('Pupil census record does not have a job status reference')
      expect(jobDataService.sqlFindLatestByTypeId).toHaveBeenCalled()
      expect(jobTypeDataService.sqlFindOneByTypeCode).toHaveBeenCalled()
    })
  })

  describe('createJobRecord', () => {
    test('calls sqlCreate method to create the pupil census record', async () => {
      jest.spyOn(jobDataService, 'sqlCreate').mockImplementation()
      jest.spyOn(jobTypeDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobTypeMock)
      jest.spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobStatusSubmittedMock)
      await pupilCensusService.createJobRecord(pupilCensusMock, { output: 'Inserted 5000 rows' })
      expect(jobDataService.sqlCreate).toHaveBeenCalled()
    })
  })

  describe('remove', () => {
    test('calls sqlUpdate method to update the pupil census record with the deleted status', async () => {
      jest.spyOn(pupilCensusDataService, 'sqlDeletePupilsByJobId').mockImplementation()
      jest.spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').mockResolvedValue(jobStatusDeletedMock)
      jest.spyOn(jobDataService, 'sqlUpdate').mockImplementation()
      await pupilCensusService.remove(1)
      expect(pupilCensusDataService.sqlDeletePupilsByJobId).toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByTypeCode).toHaveBeenCalledWith('DEL')
      expect(jobDataService.sqlUpdate).toHaveBeenCalled()
    })
    test('throws an error when argument passed is undefined', async () => {
      jest.spyOn(pupilCensusDataService, 'sqlDeletePupilsByJobId').mockImplementation()
      jest.spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').mockImplementation()
      jest.spyOn(jobDataService, 'sqlUpdate').mockImplementation()
      await expect(pupilCensusService.remove(undefined)).rejects.toThrow('No pupil census id is provided for deletion')
      expect(pupilCensusDataService.sqlDeletePupilsByJobId).not.toHaveBeenCalled()
      expect(jobStatusDataService.sqlFindOneByTypeCode).not.toHaveBeenCalledWith('DEL')
      expect(jobDataService.sqlUpdate).not.toHaveBeenCalled()
    })
  })
})
