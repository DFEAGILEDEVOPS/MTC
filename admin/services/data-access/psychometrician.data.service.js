'use strict'

const { TYPES } = require('tedious')

const sqlService = require('./sql.service')

/**
 * Psychometrician data service - test developer role can access all pupils
 */
const psychometricianDataService = {

  /**
   * Find any pupils by ids
   * @param ids
   * @return {Promise<void>}
   */
  sqlFindPupilsByIds: async (ids) => {
    // TODO: [RBAC] - only allow access from the test-developer role
    if (!(Array.isArray(ids) && ids.length > 0)) {
      throw new Error('No ids provided')
    }
    const select = `
    SELECT *
    FROM ${sqlService.adminSchema}.[pupil]
    `
    const {params, paramIdentifiers} = sqlService.buildParameterList(ids, TYPES.Int)
    const whereClause = 'WHERE id IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Find all active restarts based on pupil ids
   * @param pupilIds
   * @return {Promise<*>}
   */
  sqlFindRestartsByPupilIds: async (pupilIds) => {
    if (!(Array.isArray(pupilIds) && pupilIds.length > 0)) {
      throw new Error('No ids provided')
    }

    const {params, paramIdentifiers} = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const pupilIdsParams = paramIdentifiers.join(', ')

    const sql = `
  SELECT *
  FROM ${sqlService.adminSchema}.[pupilRestart]
  WHERE pupil_id IN (${pupilIdsParams})
  ORDER BY createdAt ASC
  `
    return sqlService.query(sql, params)
  }
}

module.exports = psychometricianDataService
