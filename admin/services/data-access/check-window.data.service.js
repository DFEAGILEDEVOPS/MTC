'use strict'

const moment = require('moment')
const CheckWindow = require('../../models/check-window')

const checkWindowDataService = {

  /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<*>}
   */
  fetchCheckWindow: async (id) => {
    return CheckWindow.findOne({'_id': id, 'deleted': false}).exec()
  },
  /**
   * Set check window as deleted.
   * @param id
   * @returns {Promise.<void>}
   */
  setDeletedCheckWindow: async (id) => {
    return CheckWindow.updateOne({'_id': id}, {$set: {'isDeleted': true}}).exec()
  },
  /**
   * Fetch check windows by status, sort by, sort direction and date (current or past).
   * @param deleted
   * @param sortBy
   * @param sortDirection
   * @param current
   * @returns {Promise.<void>}
   */
  fetchCheckWindows: async (sortBy, sortDirection, deleted, current) => {
    let sort = {}
    let query = {}

    const currentTimestamp = moment.utc(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSS')

    sort[sortBy] = sortDirection
    query.isDeleted = !deleted ? false : deleted
    if (current === true) {
      query.checkEndDate = {$gte: currentTimestamp}
    } else {
      query.checkEndDate = {$lt: currentTimestamp}
    }

    return CheckWindow
      .find(query)
      .sort(sort)
      .exec()
  },
  /**
   * Fetch (non-deleted) current check windows by sort by, sort direction
   * @param sortBy
   * @param sortDirection
   * @returns {Promise.<*|Promise.<void>>}
   */
  fetchCurrentCheckWindows: async (sortBy, sortDirection) => {
    return checkWindowDataService.fetchCheckWindows(sortBy, sortDirection, false, true)
  },
  /**
   * Fetch (non-deleted) past check windows by sort by, sort direction
   * @param sortBy
   * @param sortDirection
   * @returns {Promise.<*|Promise.<void>>}
   */
  fetchPastCheckWindows: async (sortBy, sortDirection) => {
    return checkWindowDataService.fetchCheckWindows(sortBy, sortDirection, false, false)
  }
}

module.exports = checkWindowDataService
