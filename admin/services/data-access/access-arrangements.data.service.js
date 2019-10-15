'use strict'

const sqlService = require('./sql.service')
const accessArrangementsDataService = {}
const accessArrangementCodes = {}

/**
 * Constants to describe the access arrangements codes
 */
accessArrangementsDataService.CODES = Object.freeze({
  AUDIBLE_SOUNDS: 'ATA',
  COLOUR_CONTRAST: 'CCT',
  FONT_SIZE: 'FTS',
  INPUT_ASSISTANCE: 'ITA',
  NEXT_BETWEEN_QUESTIONS: 'NBQ',
  QUESTION_READER: 'QNR',
  NUMPAD_REMOVAL: 'RON'
})

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
 * @param {Array} codes
 * @returns {Promise<Array>}
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
 * Find access arrangement codes by ids
 * @param {Array} ids
 * @returns {Promise<Array>}
 */
accessArrangementsDataService.sqlFindAccessArrangementsCodesWithIds = async function (ids) {
  if (Object.keys(accessArrangementCodes).length === 0) {
    // init
    await init()
  }
  const result = []
  Object.keys(accessArrangementCodes).forEach(code => {
    if (!accessArrangementCodes[code] || !ids.includes(accessArrangementCodes[code].id)) return
    result.push(code)
  })
  return result
}

/**
 * Initialise method to populate accessArrangementCodes for caching purposes
 * @returns {Promise<void>}
 */
const init = async () => {
  const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.[accessArrangements]`

  const accessArrangements = await sqlService.query(sql)
  accessArrangements.map(aa => {
    accessArrangementCodes[aa.code] = { id: aa.id, code: aa.code }
  })
}

module.exports = accessArrangementsDataService
