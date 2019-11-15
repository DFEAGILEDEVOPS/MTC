'use strict'

const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')

const service = {
  /**
   * Get list of pupils with groups
   * @param schoolId
   * @returns {Promise<any>}
   */
  getPupilRegister: function (schoolId) {
    const sql = `
      SELECT
         p.id as pupilId,
         p.foreName,
         p.middleNames,
         p.lastName,
         p.urlSlug,
         p.dateOfBirth,
         p.school_id,
         p.group_id,
         ISNULL(g.name, '-') as groupName
      FROM
           [mtc_admin].[pupil] p LEFT JOIN
           [mtc_admin].[group] g ON (p.group_id = g.id)
      WHERE p.school_id = @schoolId
     `
    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ]
    return sqlService.query(sql, params)
  }
}

module.exports = service
