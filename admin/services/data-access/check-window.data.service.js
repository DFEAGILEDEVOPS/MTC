'use strict'

const moment = require('moment')
const sqlService = require('./sql.service')
const { TYPES } = require('./sql.service')
const R = require('ramda')
const redisCacheService = require('./redis-cache.service')

const table = '[checkWindow]'

const checkWindowDataService = {
  /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<object>}
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
    const rows = await sqlService.readonlyQuery(sql, params)
    return R.head(rows)
  },
  /**
   * Set check window as deleted.
   * @param id
   * @returns {Promise.<*>}
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
    await sqlService.modify(sql, params)
    return redisCacheService.drop('checkWindow.sqlFindActiveCheckWindow')
  },
  /**
   * Fetch (non-deleted) check windows where the admin start date is equal to or greater than today.
   * @param sortBy - the field to sort by, defaults to name
   * @param sortDirection - the direction to sort, defaults to ascending
   * @returns {Promise.<*|Promise.<void>>}
   */
  sqlFindCurrent: async (sortBy, sortDirection) => {
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
    return sqlService.readonlyQuery(sql, params)
  },
  /**
   * Find a single current check window.  If multiple windows are concurrently running it takes the first.
   * @return {Promise<object>}
   */
  sqlFindOneCurrent: async () => {
    const checkWindows = await checkWindowDataService.sqlFindCurrent(null, null)
    return R.head(checkWindows)
  },
  /**
   * Create a new check window
   * @param data
   * @return {Promise.<*>}
   */
  sqlCreate: async (data) => {
    await sqlService.create(table, data)
    return redisCacheService.drop('checkWindow.sqlFindActiveCheckWindow')
  },
  sqlUpdate: async (data) => {
    await sqlService.update(table, data)
    return redisCacheService.drop('checkWindow.sqlFindActiveCheckWindow')
  },
  /**
   * Fetch check window by url slug.
   * @param {String} urlSlug
   * @returns {Promise<Object>}
   */
  sqlFindOneByUrlSlug: async (urlSlug) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 AND urlSlug=@urlSlug`
    const params = [
      {
        name: 'urlSlug',
        value: urlSlug,
        type: TYPES.UniqueIdentifier
      }
    ]
    const rows = await sqlService.readonlyQuery(sql, params)
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
    return sqlService.readonlyQuery(sql)
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
    return sqlService.readonlyQuery(sql)
  },

  /**
   * Fetch active check window
   * @return {Promise<Object>}
   */
  sqlFindActiveCheckWindow: async () => {
    const sql = `SELECT TOP 1 *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    AND GETUTCDATE() > adminStartDate AND GETUTCDATE() < adminEndDate`
    const result = await sqlService.readonlyQuery(sql, [], 'checkWindow.sqlFindActiveCheckWindow')
    return R.head(result)
  },

  /**
   * Fetch latest check window
   * @return {Promise<Object>}
   */
  sqlFindLatestCheckWindow: async () => {
    const sql = `SELECT TOP 1 *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    ORDER BY createdAt DESC`
    const result = await sqlService.readonlyQuery(sql)
    return R.head(result)
  }
}

module.exports = checkWindowDataService
