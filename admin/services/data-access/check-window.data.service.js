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
    let checkWindow
    checkWindow = await CheckWindow.findOne({'_id': id, 'isDeleted': false}).exec()
    return checkWindow
  },
  /**
   * Set check window as deleted.
   * @param id
   * @returns {Promise.<void>}
   */
  setDeletedCheckWindow: async (id) => {
    let checkWindow
    checkWindow = await CheckWindow.updateOne({'_id': id}, {$set: {'isDeleted': true}}).exec()
    return checkWindow
  },
  /**
   * Fetch check windows by status, sort by, sort direction and date (current or past).
   * @param isDeleted
   * @param sortBy
   * @param sortDirection
   * @param current
   * @returns {Promise.<void>}
   */
  fetchCheckWindows: async (sortBy, sortDirection, isDeleted, current) => {
    let checkWindows
    let sort = {}
    let query = {}

    const currentTimestamp = moment.utc(Date.now()).format('YYYY-MM-DD HH:mm:ss.SSS')

    sort[sortBy] = sortDirection
    query.isDeleted = !isDeleted ? false : isDeleted
    if (current === true) {
      query.checkEndDate = {$gte: currentTimestamp}
    } else {
      query.checkEndDate = {$lt: currentTimestamp}
    }

    checkWindows = await CheckWindow
      .find(query)
      .sort(sort)
      .exec()

    return checkWindows
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
