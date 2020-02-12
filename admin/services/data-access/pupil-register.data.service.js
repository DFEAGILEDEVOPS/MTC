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
   * Fetches incomplete checks based on school id.  Incomplete is defined as pupils who have
   * logged in, but not returned their answers.  This is a visual aid for the teacher.
   * @param {number} schoolId
   * @return {Promise<Number[]>} Array containing a single pupil id
   */
  getIncompleteChecks: async function (schoolId) {
    const sql = `
        SELECT TOP 1 p.id
          FROM [mtc_admin].[pupil] p
               JOIN [mtc_admin].[check] c ON (p.currentCheckId = c.id)
         WHERE p.school_id = @schoolId
           AND c.received = 0
           AND c.pupilLoginDate IS NOT NULL
    `

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ]

    return sqlService.readonlyQuery(sql, params)
  }
}

module.exports = service
