
'use strict'
/* global describe, it, fail, expect, spyOn */
const psychometricianReportDataService = require('../service/data-service/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../service/psychometrician-report.service')
const anomalyReportService = require('../service/anomaly-report.service')

const contextMock = require('../../mock-context')

describe('checkProcessingService', () => {
  const service = require('../service/check-processing.service')

  describe('cachePsychometricanReportData', () => {
    it('throws when the `batchSize` param is missing', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([1, 2, 3, 4])
      try {
        await service.cachePsychometricanReportData()
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Missing batchSize parameter')
      }
    })

    it('throws if the call to `sqlFindUnprocessedStartedChecks` does not return anything', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue(undefined)
      try {
        await service.cachePsychometricanReportData(5)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('checkProcessingService.cachePsychometricanReportData: failed to retrieve any IDs')
      }
    })

    it('throws if the response from `sqlFindUnprocessedStartedChecks` is not an array', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue({})
      try {
        await service.cachePsychometricanReportData(5)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('batchIds is not an Array')
      }
    })

    it('makes a call to the psychometrician report', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([1, 2, 3])
      spyOn(psychometricianReportService, 'batchProduceCacheData')
      spyOn(anomalyReportService, 'batchProduceCacheData')
      try {
        await service.cachePsychometricanReportData(3)
        expect(psychometricianReportService.batchProduceCacheData).toHaveBeenCalled()
      } catch (error) {
        fail('expected not to throw')
      }
    })

    it('makes a call to the anomaly report', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([1, 2, 3])
      spyOn(psychometricianReportService, 'batchProduceCacheData')
      spyOn(anomalyReportService, 'batchProduceCacheData')
      try {
        await service.cachePsychometricanReportData(3)
        expect(anomalyReportService.batchProduceCacheData).toHaveBeenCalled()
      } catch (error) {
        fail(error)
      }
    })

    it('calls a log function if there isn\'t any work to do', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([])
      spyOn(contextMock, 'log')
      try {
        await service.cachePsychometricanReportData(3, contextMock)
        expect(contextMock.log).toHaveBeenCalled()
      } catch (error) {
        fail(error)
      }
    })

    it('returns an object detailing how many reports were processed', async () => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([1, 2, 3])
      spyOn(psychometricianReportService, 'batchProduceCacheData')
      spyOn(anomalyReportService, 'batchProduceCacheData')
      try {
        const meta = await service.cachePsychometricanReportData(3)
        expect(meta).toBeTruthy()
        expect(meta.processCount).toBe(3)
      } catch (error) {
        fail(error)
      }
    })
  })
})
