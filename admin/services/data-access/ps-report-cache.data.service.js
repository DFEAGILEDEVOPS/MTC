'use strict'

const PsReportCache = require('../../models/ps-report-cache')
const psReportCacheDataService = {}

psReportCacheDataService.create = async function (data) {
  const model = new PsReportCache(data)
  return model.save()
}

module.exports = psReportCacheDataService
