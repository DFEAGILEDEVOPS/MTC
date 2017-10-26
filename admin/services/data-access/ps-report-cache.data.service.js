'use strict'

const PsReportCache = require('../../models/ps-report-cache')
const psReportCacheDataService = {}

psReportCacheDataService.save = async function (data) {
  const model = new PsReportCache(data)
  return model.save()
}

/**
 * Find one or more documents. Returns an array or null.
 * @param criteria
 * @return {Promise.<*>}
 */
psReportCacheDataService.find = async function (criteria) {
  return PsReportCache.find(criteria).lean().exec()
}

module.exports = psReportCacheDataService
