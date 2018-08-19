'use strict'

const monitor = require('../../helpers/monitor')
const sqlService = require('./sql.service')
const accessArrangementsDataService = {}
const accessArrangementCodes = {}

/**
 * Find access arrangements
 * @returns {Promise<Array>}
 */
accessArrangementsDataService.sqlFindAccessArrangements = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[accessArrangements]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

/**
 * Find access arrangement by codes
 * @param {Number} codes
 * @returns {Array}
 */
accessArrangementsDataService.sqlFindAccessArrangementsIdsWithCodes = async function (codes) {
  if (Object.keys(accessArrangementCodes).length === 0) {
    // init
    await init()
  }
  const result = []
  codes.forEach(c => {
    if (!accessArrangementCodes[c]) {
      throw new Error('Code does not exist')
    }
    result.push(accessArrangementCodes[c])
  })
  return result
}

/**
 * Initialise method to populate accessArrangementCodes for caching purposes
 * @returns {Array}
 */
const init = async () => {
  let accessArrangements
  const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.[accessArrangements]`

  accessArrangements = await sqlService.query(sql)
  accessArrangements.map(aa => {
    accessArrangementCodes[aa.code] = { id: aa.id, code: aa.code }
  })
}

module.exports = monitor('access-arrangements.data-service', accessArrangementsDataService)
