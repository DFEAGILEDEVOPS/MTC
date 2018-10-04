'use strict'

const {TYPES} = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')
const config = require('../../config')

const serviceToExport = {
  sqlFindEligiblePupilsBySchool: async (schoolId) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.vewPupilsEligibleForPinGeneration
     WHERE school_id=@schoolId AND checkCount < @maxRestartsAllowed`
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      },
      {
        name: 'maxRestartsAllowed',
        value: config.RESTART_MAX_ATTEMPTS,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  },

  sqlFindPupilsWithActivePins: async (schoolId, pinEnv) => {
    // TODO: use pinEnv to differentiate between live and familiarisation
    const param = { name: 'schoolId', type: TYPES.Int, value: schoolId }
    const sql = `
      SELECT 
        p.id,
        p.foreName,
        p.lastName,
        p.middleNames,
        p.dateOfBirth,
        p.urlSlug,
        chk.pin,
        chk.pinExpiresAt,        
        g.group_id
      FROM ${sqlService.adminSchema}.[pupil] p
      INNER JOIN ${sqlService.adminSchema}.[school] s ON p.school_id = s.id
      LEFT JOIN  ${sqlService.adminSchema}.[pupilGroup] g ON g.pupil_id = p.id
      INNER JOIN ${sqlService.adminSchema}.[check] chk ON chk.pupil_id = p.id
      INNER JOIN ${sqlService.adminSchema}.[checkStatus] chkStatus ON chk.checkStatus_id = chkStatus.id
      WHERE chk.pin IS NOT NULL
      AND s.id = @schoolId
      AND chk.pinExpiresAt IS NOT NULL
      AND chk.pinExpiresAt > GETUTCDATE()
      AND chkStatus.code = 'NEW'
      ORDER BY p.lastName ASC, p.foreName ASC, p.middleNames ASC, dateOfBirth ASC
      `
    return sqlService.query(sql, [param])
  }
}

module.exports = monitor('pin-generation.data.service', serviceToExport)
