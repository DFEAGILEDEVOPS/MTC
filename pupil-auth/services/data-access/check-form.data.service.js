'use strict'

const TYPES = require('tedious').TYPES
const sqlService = require('./sql.service')
const table = '[checkForm]'

const checkFormDataService = {
  /**
   * Get active form by id
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlGetActiveForm: (id) => {
    let sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0`
    const params = []
    if (id) {
      sql += ' AND [id]=@id'
      params.push({
        name: 'id',
        value: id,
        type: TYPES.Int
      })
    }
    return sqlService.query(sql, params)
  },
  /**
   * Fetch active forms (not deleted)
   * sorted by name
   * @param windowId only forms assigned to the specified window (optional)
   * @param sortDescending if true, sorts descending
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveFormsByName: (windowId, sortDescending) => {
    let sortOrder = 'ASC'
    if (sortDescending) {
      sortOrder = 'DESC'
    }
    const params = []
    let sql = ''
    if (windowId) {
      sql = `
      SELECT * 
      FROM ${sqlService.adminSchema}.${table} 
      WHERE isDeleted=0 
      AND [id] IN (
        SELECT checkForm_id 
        FROM checkFormWindow 
        WHERE checkWindow_id=@windowId
      )
      ORDER BY [name] ${sortOrder}`
      params.push({
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      })
    } else {
      sql = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE isDeleted=0 ORDER BY [name] ${sortOrder}`
    }
    return sqlService.query(sql, params)
  }
}

module.exports = checkFormDataService
