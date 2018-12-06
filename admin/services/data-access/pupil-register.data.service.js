'use strict'

const { TYPES } = require('tedious')

const sqlService = require('./sql.service')

const service = {
  getPupilRegister: async function (schoolId) {
    const sql = `
      SELECT
             p.id as pupilId,
             p.foreName,
             p.middleNames,
             p.lastName,
             p.urlSlug,
             p.dateOfBirth,
             g.id as groupId,
             ISNULL(g.name, '-') as groupName,
             ps.code as pupilStatusCode,
             lastCheck.id as lastCheckId,
             cs.code as checkStatusCode,
             lastPupilRestart.id as pupilRestartId,
             lastPupilRestart.check_id as pupilRestartCheckId

      FROM
           [mtc_admin].[pupil] p LEFT JOIN
           [mtc_admin].[pupilGroup] pg ON (p.id = pg.pupil_id) LEFT JOIN
           [mtc_admin].[group] g ON (pg.group_id = g.id) JOIN
           [mtc_admin].[pupilStatus] ps ON (p.pupilStatus_id = ps.id) LEFT JOIN
           (
           SELECT *,
                      ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
           FROM [mtc_admin].[check]
           ) lastCheck ON (lastCheck.pupil_id = p.id) LEFT JOIN
           [mtc_admin].[checkStatus] cs ON (lastCheck.checkStatus_id = cs.id)
                             LEFT JOIN
           (
           SELECT *,
                      ROW_NUMBER() OVER (PARTITION BY pupil_id ORDER BY id DESC) as rank
           FROM [mtc_admin].[pupilRestart]
           ) lastPupilRestart ON (p.id = lastPupilRestart.pupil_id)
      WHERE
                (lastCheck.rank = 1 or lastCheck.rank IS NULL)
      AND       (lastPupilRestart.rank = 1 or lastPupilRestart.rank IS NULL)
      AND       p.school_id = 18601
      ORDER BY  p.lastName, p.foreName ASC`

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ]

    return sqlService.query(sql, params)
  }
}

module.exports = service
