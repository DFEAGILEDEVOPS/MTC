'use strict'
/* global spyOn, describe, it, expect, fail */

const pupilCensusService = require('../../services/pupil-census.service')
const pupilCensusProcessingService = require('../../services/pupil-census-processing.service')
const jobDataService = require('../../services/data-access/job.data.service')
const jobStatusDataService = require('../../services/data-access/job-status.data.service')
const jobTypeDataService = require('../../services/data-access/job-type.data.service')

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
  jobInput: 'csv',
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
      await pupilCensusService.create(pupilCensusMock, {output: 'Inserted 5000 rows'})
      expect(jobDataService.sqlCreate).toHaveBeenCalled()
    })
  })
  describe('updateJobOutput', () => {
    it('calls updateJobOutput method to update the output fields on the pupil census record', async () => {
      spyOn(jobDataService, 'updateJobOutput')
      spyOn(jobStatusDataService, 'sqlFindOneByTypeCode').and.returnValue(jobStatusMock)
      await pupilCensusService.updateJobOutput(1, { output: 'output' })
      expect(jobDataService.updateJobOutput).toHaveBeenCalled()
    })
  })
})
