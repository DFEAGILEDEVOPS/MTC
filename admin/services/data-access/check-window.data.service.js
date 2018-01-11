'use strict'

const moment = require('moment')
const CheckWindow = require('../../models/check-window')
const winston = require('winston')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const checkWindowDataService = {
  /**
   * Fetch check window document by id.
   * @param id
   * @deprecated use sqlFetchCheckWindow
   * @returns {Promise.<*>}
   */
  fetchCheckWindow: async (id) => {
    winston.warn('check-window.data.service.fetchCheckWindow is deprecated')
    return CheckWindow.findOne({'_id': id, 'isDeleted': false}).exec()
  },
    /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<*>}
   */
  sqlFetchCheckWindow: async (id) => {
    const sql = 'SELECT * FROM [mtc_admin].[checkWindow] WHERE isDeleted=0 AND id=@id'
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Set check window as deleted.
   * @deprecated use sqlSetDeletedCheckWindow
   * @param id
   * @returns {Promise.<void>}
   */
  setDeletedCheckWindow: async (id) => {
    winston.warn('check-window.data.service.setDeletedCheckWindow is deprecated')
    return CheckWindow.updateOne({'_id': id}, {$set: {'isDeleted': true}}).exec()
  },
    /**
   * Set check window as deleted.
   * @param id
   * @returns {Promise.<void>}
   */
  sqlSetDeletedCheckWindow: async (id) => {
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      },
      {
        name: 'updatedAt',
        value: moment.utc(),
        type: TYPES.DateTimeOffset
      }
    ]
    const sql = 'UPDATE [mtc_admin].[checkWindow] SET isDeleted=1, updatedAt=@updatedAt WHERE id=@id'
    return sqlService.modify(sql, params)
  },
  /**
   * Fetch check windows by status, sort by, sort direction and date (current or past).
   * @param isDeleted
   * @param sortBy valid values are 
   * @param sortDirection
   * @param isCurrent
   * @deprecated use sqlFetchCheckWindows
   * @returns {Promise.<void>}
   */
  fetchCheckWindows: async (sortBy, sortDirection, isDeleted, isCurrent) => {
    let sorting = {}
    let query = {}
    winston.warn('check-window.data.service.fetchCheckWindows is deprecated')
    const currentTimestamp = moment.utc()
    let criteria = isDeleted ? 'isDeleted=1' : 'isDeleted=0'

    if (isCurrent === true) {
      criteria += ` AND checkEndDate >= @currentTimestamp`
    } else {
      criteria += ` AND checkEndDate <= @currentTimestamp`
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
   * Fetch check windows by status, sort by, sort direction and date (current or past).
   * @param isDeleted
   * @param sortBy
   * @param sortDirection
   * @param isCurrent
   * @returns {Promise.<void>}
   */
  sqlFetchCheckWindows: async (sortBy, sortDirection, isDeleted, isCurrent) => {
    let sorting = {}
    let query = {}
    winston.warn('check-window.data.service.fetchCheckWindows is deprecated')
    const currentTimestamp = moment.utc()
    let criteria = isDeleted ? 'isDeleted=1' : 'isDeleted=0'

    if (isCurrent === true) {
      criteria += ` AND checkEndDate >= @currentTimestamp`
    } else {
      criteria += ` AND checkEndDate <= @currentTimestamp`
    }
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
  },

  /**
   * Create a new check window
   * @param data
   * @return {Promise.<*>}
   */
  create: async (data) => {
    const cw = new CheckWindow(data)
    await cw.save()
    return cw.toObject()
  }
}

module.exports = checkWindowDataService
