'use strict'

const R = require('ramda')
const { TYPES } = require('tedious')

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const pupilAccessArrangementsDataService = {}

/**
 * Find access arrangements for pupil by id
 * @param pupilId
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqlFindAccessArrangementsByPupilId = async function (pupilId) {
  const sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.[pupilAccessArrangements] WHERE pupil_id = @pupilId`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = monitor('pupil-access-arrangements.data.service', pupilAccessArrangementsDataService)
