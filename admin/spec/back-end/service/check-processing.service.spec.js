'use strict'
/* global describe, it, expect, spyOn, beforeEach */
const psychometricianReportDataService = require('../../../services/data-access/psychometrician-report-cache.data.service')
const psychometricianReportService = require('../../../services/psychometrician-report.service')
const anomalyReportService = require('../../../services/anomaly-report.service')
const winston = require('winston')

describe('checkProcessingService', () => {
  const service = require('../../../services/check-processing.service')
  describe('#markAsProcessed', () => {
    beforeEach(() => {
      spyOn(winston, 'info')
    })
    it('bails out early if the array is empty', async (done) => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([])
      spyOn(psychometricianReportService, 'batchProduceCacheData')
      spyOn(anomalyReportService, 'batchProduceCacheData')
      const res = await service.cachePsychometricanReportData(10)
      expect(res).toBeFalsy()
      expect(psychometricianReportService.batchProduceCacheData).not.toHaveBeenCalled()
      expect(anomalyReportService.batchProduceCacheData).not.toHaveBeenCalled()
      done()
    })

    it('it calls the psychometrician report service and returns true', async (done) => {
      spyOn(psychometricianReportDataService, 'sqlFindUnprocessedStartedChecks').and.returnValue([1, 2, 3])
      spyOn(psychometricianReportService, 'batchProduceCacheData')
      spyOn(anomalyReportService, 'batchProduceCacheData')
      const res = await service.cachePsychometricanReportData(10)
      expect(res).toBeTruthy()
      expect(psychometricianReportService.batchProduceCacheData).toHaveBeenCalled()
      expect(anomalyReportService.batchProduceCacheData).toHaveBeenCalled()
      done()
    })
  })

  describe('#process', () => {
    it('initially find out if there is any work to do', async (done) => {
      spyOn(winston, 'info')
      spyOn(psychometricianReportDataService, 'sqlHasUnprocessedStartedChecks').and.returnValue(false)
      spyOn(service, 'cachePsychometricanReportData').and.returnValue(true)
      await service.process()
      expect(psychometricianReportDataService.sqlHasUnprocessedStartedChecks).toHaveBeenCalled()
      expect(service.cachePsychometricanReportData).not.toHaveBeenCalled()
      done()
    })

    it('calls cachePsychometricanReportData to handle any work', async (done) => {
      spyOn(psychometricianReportDataService, 'sqlHasUnprocessedStartedChecks').and.returnValues(true)
      spyOn(service, 'cachePsychometricanReportData').and.returnValue(true)

      await service.process()
      expect(psychometricianReportDataService.sqlHasUnprocessedStartedChecks).toHaveBeenCalled()
      expect(service.cachePsychometricanReportData).toHaveBeenCalledTimes(1)
      done()
    })
  })
})
