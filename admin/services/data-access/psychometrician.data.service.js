'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')

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
  }
}

module.exports = psychometricianDataService
