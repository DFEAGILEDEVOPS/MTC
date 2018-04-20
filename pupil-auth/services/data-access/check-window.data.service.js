'use strict'

const moment = require('moment')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')
const table = '[checkWindow]'

const checkWindowDataService = {
  /**
   * Fetch check windows by status, sort by, sort direction and date (current or past).
   * @param sortBy valid values are [checkWindowName|adminStartDate|checkStartDate]
   * @param sortDirection valid values are [asc|desc]
   * @returns {Promise.<void>}
   */
  sqlFindCurrentAndFutureWithFormCount: async (sortBy, sortDirection) => {
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
  },
}

module.exports = checkWindowDataService
