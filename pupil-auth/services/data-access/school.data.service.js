'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const sqlService = require('./sql.service')
const table = '[school]'

const schoolDataService = {
  /**
   * Find a School from the pin
   * @param {number} pin
   * @return {Promise<void>}
   */
  sqlFindOneBySchoolPin: async (pin) => {
    const paramPin = {name: 'pin', type: TYPES.Char, value: pin}
    const sql = `
        SELECT *    
        FROM ${sqlService.adminSchema}.${table}
        WHERE pin = @pin
      `
    const rows = await sqlService.query(sql, [paramPin])
    return R.head(rows)
  }
}

module.exports = schoolDataService
