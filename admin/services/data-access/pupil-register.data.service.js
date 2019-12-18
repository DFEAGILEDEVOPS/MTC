'use strict'

const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')

const service = {
  getPupilRegister: async function (schoolId) {
    const sql = `
     SELECT * FROM [mtc_admin].[vewPupilRegister]
     WHERE school_id = @schoolId
     ORDER BY lastName, foreName ASC`

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ]

    return sqlService.readonlyQuery(sql, params)
  },

  /**
   * Fetches incomplete checks based on school id.
   * @param {number} schoolId
   * @return {Promise<Array>} pupils
   */
  getIncompleteChecks: async function (schoolId) {
    const sql = `
    SELECT TOP 1 *
    FROM [mtc_admin].[vewPupilRegister]
    WHERE school_id = @schoolId
    AND currentCheckId IS NOT NULL
    AND checkComplete = 0
    AND pupilLoginDate IS NOT NULL
    AND checkStatusCode <> 'EXP'
    `

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ]

    return sqlService.readonlyQuery(sql, params)
  }
}

module.exports = service
