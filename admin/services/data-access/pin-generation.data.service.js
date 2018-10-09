'use strict'

const { TYPES } = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')


const serviceToExport = {
  sqlFindEligiblePupilsBySchool: async (schoolId) => {
    const sql = `SELECT 
                  * 
                FROM ${sqlService.adminSchema}.vewPupilsEligibleForPinGeneration
                WHERE school_id=@schoolId                 
                ORDER BY lastName asc, foreName asc, middleNames asc `
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
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
  },


  sqlFindPupilsEligibleForPinGenerationById: async (schoolId, pupilIds) => {
    const select = `SELECT * 
                    FROM ${sqlService.adminSchema}.[vewPupilsEligibleForPinGeneration]`
    let { params, paramIdentifiers } = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const whereClause = `WHERE id IN (${paramIdentifiers.join(', ')}) AND school_id = @schoolId`
    params.push({
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    })
    const sql = [ select, whereClause ].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Find checks that are being re-started
   * @param {number} - schoolId
   * @param {[number]} checkIds - all check Ids generated during pin generation
   * @param {[number]} pupilIds - pupils known to be doing a restart
   */
  sqlFindChecksForPupilsById: async (schoolId, checkIds, pupilIds) => {
    const select = `SELECT * 
                    FROM ${sqlService.adminSchema}.[check]`
    const schoolParam = {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
    const checkParams = checkIds.map( (checkId, index) => { return { name: `checkId${index}`, value: checkId, type: TYPES.Int } } )
    const checkIdentifiers = checkIds.map( (checkId, index) => `@checkId${index}` )
    const pupilParams = pupilIds.map( (pupilId, index) => { return { name: `pupilId${index}`, value: pupilId, type: TYPES.Int } } )
    const pupilIdentifiers = pupilIds.map( (pupilId, index) => `@pupilId${index}` )
    const whereClause = `WHERE school_id = @schoolId 
                         AND id IN (${checkIdentifiers.join(', ')}) 
                         AND pupil_id IN (${pupilIdentifiers.join(', ')})`
    const sql = [select, whereClause].join('\n')
    return sqlService.query(sql, [schoolParam].concat(checkParams).concat(pupilParams))
  },

  /**
   * Update one or more pupilRestarts with the checkId that consumed the restart
   * This happens at pin generation.
   * @param updateData - [ { pupilRestartId: 2, checkId: 3}, [...] ]
   */
  updatePupilRestartsWithCheckInformation: async (updateData) => {
    console.log('updatePupilRestartsWithCheckInformation() entered: ', updateData)
    const restartIdParams = updateData.map( ( data, index ) => { return { name: `checkId${index}`, value: data.checkId, type: TYPES.Int } } )
    const pupilRestartParams = updateData.map( (data, index) => { return { name: `pupilRestartId${index}`, value: data.pupilRestartId, type: TYPES.Int } } )
    const updates = updateData.map( ( data, index ) => `UPDATE ${sqlService.adminSchema}.[pupilRestart] SET check_id = @checkId${index} WHERE id = @pupilRestartId${index}` )
    sqlService.modify(updates.join(";\n"), restartIdParams.concat(pupilRestartParams))
  }
}

module.exports = monitor('pin-generation.data.service', serviceToExport)
