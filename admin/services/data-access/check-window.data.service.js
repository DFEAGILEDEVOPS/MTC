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
    return CheckWindow.findOne({'_id': id, 'isDeleted': false}).exec()
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
    let sorting = {}
    let query = {}

    const currentTimestamp = moment.utc(Date.now()).format('YYYY-MM-D HH:mm:ss.SSS')

    query.isDeleted = !deleted ? false : deleted
    if (current === true) {
      query.checkEndDate = {$gte: currentTimestamp}
    }

    if (sortBy && sortDirection) {
      sorting[sortBy] = sortDirection
    }

    return CheckWindow
      .find(query)
      .sort(sorting)
      .exec()
  },
  /**
   * Fetch (one) check window for present date.
   * @returns {Promise.<*>}
   */
  fetchCurrentCheckWindow: async () => {
    const now = new Date()
    const checkWindow = await CheckWindow.findOne({startDate: {$lte: now}, endDate: {$gte: now}}).exec()
    if (!checkWindow) {
      throw new Error('No check-window is currently available')
    }
    return checkWindow
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
