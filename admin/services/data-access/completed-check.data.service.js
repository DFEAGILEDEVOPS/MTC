'use strict'

const CompletedChecks = require('../../models/completed-checks')
const completedCheckDataService = {}

/**
 * Query : find a completedCheck document that has not been marked
 * @type {{$or: [null,null]}}
 */
const unmarkedQueryCriteria = {
  '$or': [
    { isMarked: { $exists: false } },
    { isMarked: false }
  ]
}

/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = async function (data) {
  const completedCheck = new CompletedChecks(data)
  return completedCheck.save()
}
// used by check-complete.service to insert pupil check

/**
 * Save a document (plain javascript object) with an existing _id field - uses replaceOne()
 * @param doc
 * @return {Promise.<*>}
 */
completedCheckDataService.save = async function (doc) {
  return CompletedChecks.replaceOne({_id: doc._id}, doc).exec()
}

/**
 * Find one or more documents. Returns an array or null.
 * @param criteria
 * @return {Promise.<*>}
 */
completedCheckDataService.find = async function (criteria) {
  return CompletedChecks.find(criteria).lean().exec()
}
// used by pupil-status.service to find latest completed check by pupil

/**
 * Count the number of documents that match `criteria`
 * @param criteria
 * @return {Promise.<*>}
 */
completedCheckDataService.count = async function (criteria) {
  return CompletedChecks.count(criteria).exec()
}

/**
 * Return a boolean if there are documents that have not been marked.
 * @return {Promise.<boolean>}
 */
completedCheckDataService.hasUnmarked = async function () {
  const count = await this.count(unmarkedQueryCriteria)
  return count > 0
}

/**
 * Return plain completedCheck objects that have not been marked, up to a the limit specified by `batchsize`
 * Returns an array of Ids: [1234, 5678, ...] of CompletedChecks.  Used by the batch processor.
 * @param batchSize
 * @return {Promise.<Array>}
 */
completedCheckDataService.findUnmarked = async function (batchSize) {
  if (!batchSize) {
    throw new Error('Missing argument: batchSize')
  }
  const batchIds = await CompletedChecks.find(
    unmarkedQueryCriteria, { _id: 1 }
  )
    // .sort({ createdAt: 1 })
    .limit(batchSize)
    .lean()
    .exec()
  return batchIds.map(b => b._id)
}

/**
 * Generalised update function - use with care
 * @param query
 * @param criteria
 * @return {Promise}
 */
completedCheckDataService.update = async function (query, criteria, options = {}) {
  return CompletedChecks.update(query, criteria, options).exec()
}
// used by PS Report to set all unmarked

module.exports = completedCheckDataService
