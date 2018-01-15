'use strict'

const moment = require('moment')
const CheckWindow = require('../../models/check-window')
const winston = require('winston')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const checkWindowDataService = {
  /**
   * Fetch check window document by id.
   * @param id
   * @deprecated use sqlFindOneById
   * @returns {Promise.<*>}
   */
  fetchCheckWindow: async (id) => {
    winston.warn('check-window.data.service.fetchCheckWindow is deprecated')
    return CheckWindow.findOne({'_id': id, 'isDeleted': false}).exec()
  },
    /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<void>}
   */
  sqlFindOneById: async (id) => {
    const sql = 'SELECT * FROM [mtc_admin].[checkWindow] WHERE isDeleted=0 AND id=@id'
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      }
    ]
    const rows = await sqlService.query(sql, params)
    return R.head(rows)
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
   * @param sortBy valid values are [checkWindowName|adminStartDate|checkStartDate]
   * @param sortDirection valid values are [asc|desc]
   * @param isCurrent
   * @deprecated use sqlFind
   * @returns {Promise.<*>}
   */
  fetchCheckWindows: async (sortBy, sortDirection, isDeleted, isCurrent) => {
    let sorting = {}
    let query = {}

    const currentTimestamp = moment.utc(Date.now()).format('YYYY-MM-D 00:00:00')

    query.isDeleted = !isDeleted ? false : isDeleted
    if (isCurrent === true) {
      query.checkEndDate = {$gte: currentTimestamp}
    } else {
      query.checkEndDate = {$lte: currentTimestamp}
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
   * @param sortBy valid values are [checkWindowName|adminStartDate|checkStartDate]
   * @param sortDirection valid values are [asc|desc]
   * @param isCurrent
   * @returns {Promise.<void>}
   */
  sqlFind: async (sortBy, sortDirection, isDeleted, isCurrent) => {
    const currentTimestamp = moment.utc().toDate()
    let criteria = isDeleted ? 'isDeleted=1' : 'isDeleted=0'

    if (isCurrent === true) {
      isDeleted += ` AND checkEndDate >= @currentTimestamp`
    } else {
      isDeleted += ` AND checkEndDate <= @currentTimestamp`
    }
    sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
    switch (sortBy) {
      case 'checkWindowName':
        sortBy = 'name'
        break
      case 'adminStartDate':
      case 'checkStartDate':
      // all 3 are acceptable as-is
        break
      default:
      // anything else should default to checkWindow name
        sortBy = 'name'
    }

    const sql = `SELECT * FROM [mtc_admin].[vewCheckWindowsWithFormCount] WHERE ${criteria} ORDER BY ${sortBy} ${sortDirection}`
    const params = [
      {
        name: 'currentTimestamp',
        value: currentTimestamp,
        type: TYPES.DateTimeOffset
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Fetch (one) check window for present date.
   * @deprecated use sqlFetchCurrentCheckWindow
   * @returns {Promise.<*>}
   */
  fetchCurrentCheckWindow: async () => {
    winston.warn('deprecated. use check-window.data.service.sqlFetchCurrentCheckWindow')
    const now = new Date()
    const checkWindow = await CheckWindow.findOne({startDate: {$lte: now}, endDate: {$gte: now}}).exec()
    if (!checkWindow) {
      throw new Error('No check-window is currently available')
    }
    return checkWindow
  },
    /**
   * Fetch (one) check window for present date.
   * @returns {Promise.<*>}
   */
  sqlFetchCurrentCheckWindow: async () => {
    const now = moment.utc()
    const sql = `SELECT * FROM [mtc_admin].[checkWindow] WHERE 
      adminStartDate <=@currentTimestamp AND
       adminStartDate >=@currentTimestamp`
    const params = [
      {
        name: 'currentTimestamp',
        value: now,
        type: TYPES.DateTimeOffset
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Fetch (non-deleted) current check windows by sort by, sort direction
   * @param sortBy
   * @param sortDirection
   * @returns {Promise.<*|Promise.<void>>}
   */
  sqlFindCurrent: async (sortBy, sortDirection) => {
    return checkWindowDataService.sqlFind(sortBy, sortDirection, false, true)
  },
  /**
   * Fetch (non-deleted) past check windows by sort by, sort direction
   * @param sortBy
   * @param sortDirection
   * @returns {Promise.<*|Promise.<void>>}
   */
  sqlFindPast: async (sortBy, sortDirection) => {
    return checkWindowDataService.sqlFind(sortBy, sortDirection, false, false)
  },
  /**
   * Create a new check window
   * @param data
   * @deprecated use sqlCreate
   * @return {Promise.<*>}
   */
  create: async (data) => {
    const cw = new CheckWindow(data)
    await cw.save()
    return cw.toObject()
  },
    /**
   * Create a new check window
   * @param data
   * @return {Promise.<*>}
   */
  sqlCreate: async (data) => {
    return sqlService.create('[checkWindow]', data)
  },
  sqlFetchCheckWindowsAssignedToForms: async (formIds) => {
    let sql = `SELECT cw.[id], cw.[name] FROM mtc_admin.checkWindow cw
    INNER JOIN mtc_admin.checkFormWindow cfw
      ON cw.id = cfw.[checkWindow_id]`

    let whereClause = ' WHERE cfw.checkForm_id IN ('
    const params = []
    for (let index = 0; index < formIds.length; index++) {
      whereClause = whereClause + `@p${index}`
      if (index < formIds.length - 1) {
        whereClause += ','
      }
      params.push({
        name: `p${index}`,
        value: formIds[index],
        type: TYPES.Int
      })
    }
    whereClause = whereClause + ')'
    sql = sql + whereClause + ' ORDER BY cw.checkStartDate'
    return sqlService.query(sql, params)
  },
  sqlAssignFormsToWindow: async (checkWindowId, checkFormIds) => {
    const inserts = []
    for (let index = 0; index < checkFormIds.length; index++) {
      const formId = checkFormIds[index]
      inserts.push(sqlService.create('[checkFormWindow]',
        {
          checkForm_id: formId,
          checkWindow_id: checkWindowId
        }
      ))
    }
    return Promise.all(inserts)
  }
}

module.exports = checkWindowDataService
