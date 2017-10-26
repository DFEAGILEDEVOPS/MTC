'use strict'
const PsReportCache = require('../../models/ps-report-cache')
const psReportCacheDataService = {}

/**
 * Save a document, replacing any existing document
 * @param data
 * @return {Promise.<*>} returns a mongo response doc `{ n: 1, nModified: 1, ok: 1 }`
 */
psReportCacheDataService.save = async function (doc) {
  return PsReportCache.update({_id: doc._id}, doc, {upsert: true}).exec()
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
