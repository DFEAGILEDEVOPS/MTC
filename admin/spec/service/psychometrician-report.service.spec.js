'use strict'
/* global describe, expect, it, beforeEach, afterEach, fail, spyOn */

const winston = require('winston')

const checkDataService = require('../../services/data-access/check.data.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const completedCheckDataService = require('../../services/data-access/completed-check.data.service')
const psychometricianReportCacheDataService = require('../../services/data-access/psychometrician-report-cache.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')

// Get a marked check mock
// const checkMockOrig = require('../mocks/check-with-results')

// // and a completedCheck that has been marked
const completedCheckMockOrig = require('../mocks/completed-check-with-results')
// const pupilMockOrig = require('../mocks/pupil')
// const schoolMockOrig = require('../mocks/school')
//
// const completedCheckMock = Object.assign({ check: {} }, completedCheckMockOrig)
// const checkMock = Object.assign({}, checkMockOrig)
// const pupilMock = Object.assign({}, pupilMockOrig)
// const schoolMock = Object.assign({}, schoolMockOrig)
// completedCheckMock.check = checkMock
// pupilMock.school = schoolMock
// completedCheckMock.check.pupilId = pupilMock

describe('psychometricians-report.service', () => {
  const service = require('../../services/psychometrician-report.service')

  fdescribe('#batchProduceCacheData', () => {
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

  fdescribe('#produceReportData', () => {
    it('returns the data', () => {
      spyOn(winston, 'info')
      const check = {
        id: 1,
        pupil_id: 10,
        checkCode: 'ABC-DEF',
        checkWindow_id: 20,
        checkForm_id: 30,
        mark: 10,
        maxMark: 30,
        data: {

        }
      }
      const pupil = {

      }
      const checkForm = {

      }
      const data = service.produceReportData(check, pupil, checkForm)
      expect(data).toBeTruthy()
      expect(data.Surname).toBeTruthy()
      expect(data.Forename).toBeTruthy()
    })
  })

  describe('#generateReport', () => {
    let service, psReportCacheDataServiceStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'find').resolves([
        {data: {propOne: 'valOne', propTwo: 1}},
        {data: {propOne: 'ValTwo', propTwo: 2}},
        {data: {propOne: 'valThree', propTwo: null}}
      ])
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
    })

    it('returns a csv string', async (done) => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('propOne')
      expect(psReportCacheDataServiceStub.callCount).toBe(1)
      done()
    })
  })

  describe('#generateScoreReport', () => {
    let service, psReportCacheDataServiceStub

    beforeEach(() => {
      psReportCacheDataServiceStub = sandbox.stub(psReportCacheDataService, 'find').resolves([
        {data: {Surname: 'valOne', propTwo: 1}},
        {data: {Forename: 'ValTwo', propTwo: 2}},
        {data: {MiddleNames: 'valThree', propTwo: null}}
      ])
      service = proxyquire('../../services/psychometrician-report.service', {
        './data-access/ps-report-cache.data.service': psReportCacheDataService
      })
    })

    it('returns a csv string', async (done) => {
      const res = await service.generateReport()
      expect(res).toBeTruthy()
      expect(res.substr(0, 7)).toBe('Surname')
      expect(psReportCacheDataServiceStub.callCount).toBe(1)
      done()
    })
  })
})
