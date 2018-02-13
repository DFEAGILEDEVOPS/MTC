'use strict'
/* global describe, expect, it, beforeEach, fail, spyOn */

const moment = require('moment')
const winston = require('winston')

const checkFormDataService = require('../../services/data-access/check-form.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const psychometricianReportCacheDataService = require('../../services/data-access/psychometrician-report-cache.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')

// A mock completed Check that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')

describe('psychometricians-report.service', () => {
  const service = require('../../services/psychometrician-report.service')

  describe('#batchProduceCacheData', () => {
    beforeEach(() => {
      spyOn(completedCheckDataService, 'sqlFindByIds').and.returnValue([
        {id: 9, pupil_id: 1, checkForm_id: 2},
        {id: 10, pupil_id: 2, checkForm_id: 3},
        {id: 11, pupil_id: 3, checkForm_id: 4}
      ])
      spyOn(pupilDataService, 'sqlFindByIds').and.returnValue([
        {id: 1, school_id: 5},
        {id: 2, school_id: 6},
        {id: 3, school_id: 7}
      ])
      spyOn(checkFormDataService, 'sqlFindByIds').and.returnValue([
        {id: 2},
        {id: 3},
        {id: 4}
      ])
      spyOn(schoolDataService, 'sqlFindByIds').and.returnValue([
        {id: 5},
        {id: 6},
        {id: 7}
      ])
      spyOn(service, 'produceReportData')
      spyOn(psychometricianReportCacheDataService, 'sqlInsertMany')
    })

    it('throws an error if not provided with an argument', async () => {
      try {
        await service.batchProduceCacheData()
        fail('expected to be thrown')
      } catch (error) {
        expect(error.message).toBe('Missing argument: batchIds')
      }
    })

    it('throws an error if not provided with a array of positive length', async () => {
      try {
        await service.batchProduceCacheData(123)
        fail('expected to be thrown')
      } catch (error) {
        expect(error.message).toBe('Invalid arg: batchIds')
      }
    })

    it('throws an error out if checks are not found', async () => {
      completedCheckDataService.sqlFindByIds.and.returnValue(undefined)
      try {
        await service.batchProduceCacheData([1, 2, 3])
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Failed to find any checks')
      }
    })

    it('retrieves all the batchIds in one go', async () => {
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(completedCheckDataService.sqlFindByIds).toHaveBeenCalledTimes(1)
      } catch (error) {
        fail(error)
      }
    })

    it('calls produceReportData for each check with the right arguments', async () => {
      try {
        await service.batchProduceCacheData([1, 2, 3])
        expect(service.produceReportData).toHaveBeenCalledTimes(3)
        const args = service.produceReportData.calls.argsFor(0)
        expect(args[0].id).toBe(9) // check
        expect(args[1].id).toBe(1) // pupil
        expect(args[2].id).toBe(2) // checkForm
      } catch (error) {
        fail(error)
      }
    })
  })

  describe('#produceReportData', () => {
    it('returns the data', () => {
      spyOn(winston, 'info')
      const pupil = {
        id: 12,
        foreName: 'Mocky',
        middleNames: 'Mockable',
        lastName: 'McMock',
        dateOfBirth: moment().subtract(8, 'years'),
        upn: 'F673001000200',
        gender: 'M'
      }
      const checkForm = {
        id: 42,
        name: 'MtcMock99'
      }
      const school = {
        id: 99,
        name: 'Schooly McSchool',
        leaCode: '999',
        estabCode: 1999,
        dfeNumber: 9991999,
        urn: 'URN99'
      }
      const data = service.produceReportData(completedCheckMockOrig, pupil, checkForm, school)
      expect(data).toBeTruthy()
      expect(data.PupilId).toBeTruthy()
      expect(data.TestDate).toBe('20180211')
    })
  })

  describe('#generateReport', () => {
    beforeEach(() => {
      spyOn(psychometricianReportCacheDataService, 'sqlFindAll').and.returnValue([
        {jsonData: {PupilId: 'valOne', propTwo: 1}},
        {jsonData: {Mark: 'ValTwo', propTwo: 2}},
        {jsonData: {Response: 'valThree', propTwo: null}}
      ])
    })

    it('returns a csv string', async () => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('PupilId')
    })
  })

  describe('#generateScoreReport', () => {
    beforeEach(async () => {
      spyOn(psychometricianReportCacheDataService, 'sqlFindAll').and.returnValue([
        {jsonData: {PupilId: 'valOne', propTwo: 1}},
        {jsonData: {Mark: 'ValTwo', propTwo: 2}},
        {jsonData: {Response: 'valThree', propTwo: null}}
      ])
    })

    it('returns a csv string', async () => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('PupilId')
    })
  })
})
