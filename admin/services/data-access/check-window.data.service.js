'use strict'

const moment = require('moment')
const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const R = require('ramda')
const cache = require('./cache.service')
const cacheKeyPrefix = 'CheckWindow'

const table = '[checkWindow]'

const checkWindowDataService = {
  /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<void>}
   */
  sqlFindOneById: async (id) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindOneById:${id}`)
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
   * @param sortBy valid values are [checkWindowName|adminStartDate|checkStartDate]
   * @param sortDirection valid values are [asc|desc]
   * @returns {Promise.<void>}
   */
  sqlFindCurrentAndFutureWithFormCount: async (sortBy, sortDirection) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindCurrentAndFutureWithFormCount`)
    const currentTimestamp = moment.utc().toDate()
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
    const sql = `SELECT * FROM ${sqlService.adminSchema}.[vewCheckWindowsWithFormCount] WHERE isDeleted=0 AND
                  checkEndDate >= @currentTimestamp ORDER BY ${sortBy} ${sortDirection}`
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
   * Fetch check windows by status, sort by, sort direction and date (current).
   * @param sortBy valid values are [checkWindowName|adminStartDate|checkStartDate]
   * @param sortDirection valid values are [asc|desc]
   * @returns {Promise.<void>}
   */
  sqlFindFutureWithFormCount: async (sortBy, sortDirection) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindFutureWithFormCount`)
    const currentTimestamp = moment.utc().toDate()
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
    const sql = `SELECT * FROM ${sqlService.adminSchema}.[vewCheckWindowsWithFormCount] WHERE isDeleted=0 AND
                  checkEndDate >= @currentTimestamp AND checkStartDate >= @currentTimestamp ORDER BY ${sortBy} ${sortDirection}`
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
   * Find current and future check windows
   * @param sortBy
   * @param sortDirection
   * @returns {Promise<*>}
   */
  sqlFindCurrentAndFuture: async (sortBy, sortDirection) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindCurrentAndFuture`)
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
    const sql = `SELECT [id], [name], adminStartDate, checkStartDate, checkEndDate, isDeleted
                FROM ${sqlService.adminSchema}.[checkWindow] WHERE isDeleted=0 AND
                checkEndDate >=@currentTimestamp
                ORDER BY ${sortBy} ${sortDirection}`
    const params = [
      {
        name: 'currentTimestamp',
        type: TYPES.DateTimeOffset,
        value: moment.utc().toDate()
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Fetch (non-deleted) check windows where the admin start date is equal to or greater than today.
   * @param sortBy - the field to sort by, defaults to name
   * @param sortDirection - the direction to sort, defaults to ascending
   * @returns {Promise.<*|Promise.<void>>}
   */
  sqlFindCurrent: async (sortBy, sortDirection) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindCurrent`)
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
    const sql = `SELECT [id], [name], adminStartDate, checkStartDate, checkEndDate, isDeleted
                  FROM ${sqlService.adminSchema}.[checkWindow] WHERE isDeleted=0 AND
                  (adminStartDate <=@currentTimestamp AND checkEndDate >=@currentTimestamp)
                  ORDER BY ${sortBy} ${sortDirection}`
    const params = [
      {
        name: 'currentTimestamp',
        type: TYPES.DateTimeOffset,
        value: moment.utc().toDate()
      }
    ]
    return sqlService.query(sql, params)
  },
  /**
   * Find a single current check window.  If multiple windows are concurrently running it takes the first.
   * @return {Promise<void>}
   */
  sqlFindOneCurrent: async () => {
    cache.increment(`${cacheKeyPrefix}:sqlFindOneCurrent`)
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
    cache.increment(`${cacheKeyPrefix}:sqlFindPast`)
    const sql = `SELECT [id], [name], adminStartDate, checkStartDate, checkEndDate, isDeleted
    FROM ${sqlService.adminSchema}.[checkWindow] WHERE isDeleted=0 AND checkEndDate < @currentTimestamp`
    const params = [
      {
        name: 'currentTimestamp',
        type: TYPES.DateTimeOffset,
        value: moment.utc().toDate()
      }
    ]
    return sqlService.query(sql, params)
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
    cache.increment(`${cacheKeyPrefix}:sqlFindOneActiveCheckWindow`)
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
  },

  /**
   * Find all check windows
   * @param sortBy
   * @param sortDirection
   * @returns [{Object}]
   */
  sqlFindAllCheckWindows: async (sortBy, sortDirection) => {
    sortDirection = sortDirection !== 'asc' ? 'desc' : 'asc'
    switch (sortBy) {
      case 'checkWindowName':
        sortBy = 'name'
        break
      case 'adminStartDate':
      case 'checkStartDate':
        break
      default:
        sortBy = 'name'
    }
    const sql = `SELECT [id], [name], adminStartDate, checkStartDate, checkEndDate, isDeleted
                FROM ${sqlService.adminSchema}.[checkWindow]
                WHERE isDeleted=0
                ORDER BY ${sortBy} ${sortDirection}`
    const params = []
    return sqlService.query(sql, params)
  },

  /**
   * Fetch check window by url slug.
   * @param {String} urlSlug
   * @returns {Object}
   */
  sqlFindOneByUrlSlug: async (urlSlug) => {
    cache.increment(`${cacheKeyPrefix}:sqlFindOneByUrlSlug:${urlSlug}`)
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 AND urlSlug=@urlSlug`
    const params = [
      {
        name: 'urlSlug',
        value: urlSlug,
        type: TYPES.UniqueIdentifier
      }
    ]
    const rows = await sqlService.query(sql, params)
    return R.head(rows)
  },

  /**
   * Fetch all check windows with status
   * @return {Promise<Array>}
   */
  sqlFindCheckWindowsWithStatus: async () => {
    const sql = `SELECT *
    FROM ${sqlService.adminSchema}.[vewCheckWindowWithStatus]
    WHERE isDeleted=0
    ORDER BY name ASC`
    return sqlService.query(sql)
  },

  /**
   * Fetch all check windows with status and check form count by check form type
   * @return {Promise<Array>}
   */
  sqlFindCheckWindowsWithStatusAndFormCountByType: async () => {
    const sql = `SELECT *
    FROM ${sqlService.adminSchema}.[vewCheckWindowsWithStatusAndFormCountByType]
    WHERE isDeleted = 0
    ORDER BY createdAt ASC`
    return sqlService.query(sql)
  },

  /**
   * Fetch active check window
   * @return {Object}
   */
  sqlFindActiveCheckWindow: async () => {
    cache.increment(`${cacheKeyPrefix}:sqlFindActiveCheckWindow`)
    const sql = `SELECT TOP 1 *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    AND GETUTCDATE() > adminStartDate AND GETUTCDATE() < adminEndDate`
    const result = await sqlService.query(sql)
    return R.head(result)
  },

  /**
   * Fetch latest check window
   * @return {Object}
   */
  sqlFindLatestCheckWindow: async () => {
    cache.increment(`${cacheKeyPrefix}:sqlFindLatestCheckWindow`)
    const sql = `SELECT TOP 1 *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    ORDER BY createdAt DESC`
    const result = await sqlService.query(sql)
    return R.head(result)
  }
}

module.exports = checkWindowDataService
