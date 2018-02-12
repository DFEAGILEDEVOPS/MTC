'use strict'

const moment = require('moment')
const CheckWindow = require('../../models/check-window')
const winston = require('winston')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')
const table = '[checkWindow]'

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
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 AND id=@id`
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
   * @deprecated use sqlDeleteCheckWindow
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
  sqlDeleteCheckWindow: async (id) => {
    const params = [
      {
        name: 'id',
        value: id,
        type: TYPES.Int
      }
    ]
    const sql = `UPDATE ${sqlService.adminSchema}.${table} SET isDeleted=1 WHERE id=@id`
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
      criteria += ` AND checkEndDate >= @currentTimestamp`
    } else {
      criteria += ` AND checkEndDate <= @currentTimestamp`
    }
    sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
    switch (sortBy) {
      case 'checkWindowName':
        sortBy = 'name'
        break
      case 'adminStartDate':
      case 'checkStartDate':
      // are acceptable as-is
        break
      default:
      // anything else should default to checkWindow name
        sortBy = 'name'
    }

    const sql = `SELECT * FROM ${sqlService.adminSchema}.[vewCheckWindowsWithFormCount] WHERE ${criteria} ORDER BY ${sortBy} ${sortDirection}`
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
    winston.warn('deprecated. use check-window.data.service.sqlFindCurrent')
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
  sqlFindCurrent: async (sortBy, sortDirection) => {
    const sql = `SELECT [id], [name], adminStartDate, checkStartDate, checkEndDate, isDeleted
                  FROM ${sqlService.adminSchema}.[checkWindow] WHERE isDeleted=0 AND
                  (adminStartDate <=@currentTimestamp AND checkEndDate >=@currentTimestamp)`
    const params = [
      {
        name: 'currentTimestamp',
        type: TYPES.DateTimeOffset,
        value: moment.utc()
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Find a single current check window.  If multiple windows are concurrently running it takes the first.
   * @return {Promise<void>}
   */
  sqlFindOneCurrent: async () => {
    const checkWindows = await checkWindowDataService.sqlFindCurrent(null, null)
    return R.head(checkWindows)
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
   * Save check window
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
    return sqlService.create(table, data)
  },
  sqlUpdate: async (data) => {
    return sqlService.update('[checkWindow]', data)
  },
  sqlFindCheckWindowsAssignedToForms: async (formIds) => {
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
  },
  /**
   * Find active check windows
   * @param checkWindowId
   * @return {Object}
   */
  sqlFindOneActiveCheckWindow: async (checkWindowId) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    AND id = @checkWindowId
    AND @currentTimeStamp >= checkStartDate 
    AND @currentTimeStamp <= checkEndDate`

    const currentTimestamp = moment.utc().toDate()
    const params = [
      {
        name: 'currentTimestamp',
        value: currentTimestamp,
        type: TYPES.DateTimeOffset
      },
      {
        name: 'checkWindowId',
        value: checkWindowId,
        type: TYPES.Int
      }
    ]
    const result = await sqlService.query(sql, params)
    return R.head(result)
  }
}

module.exports = checkWindowDataService
