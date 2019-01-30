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

    return sqlService.query(sql, params)
  }
}

module.exports = service
