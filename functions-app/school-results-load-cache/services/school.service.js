'use strict'

const sqlService = require('../../lib/sql/sql.service')
const resultService = require('./result.service')
const base = require('../../lib/logger')

const schoolService = {
  /**
   * Return school data
   * @return {Promise<{id: number, name: string}[]>}
   */
  retrieveAll: function retrieveAll () {
    const sql = 'SELECT id, name FROM mtc_admin.school'
    return sqlService.query(sql, {})
  },

  processOne: async function processOne (school) {
    console.log(`Processing ${school.id} - ${school.name}`)
    // if we throw from here the remaining schools will not be processed
    try {
      await resultService.cacheResultData(school.id, schoolService.logger)
      return {
        id: school.id,
        name: school.name,
        success: true
      }
    } catch (error) {
      return {
        id: school.id,
        name: school.name,
        success: false,
        error
      }
    }
  }
}

module.exports = Object.assign(schoolService, base)
