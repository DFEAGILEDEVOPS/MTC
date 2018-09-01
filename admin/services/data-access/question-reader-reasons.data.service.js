'use strict'

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')
const questionReaderReasonsDataService = {}
const questionReaderCodes = {}

/**
 * Constants to describe the question reader reason codes
 */
questionReaderReasonsDataService.CODES = Object.freeze({
  ENGLISH_AS_ADDITIONAL_LANGUAGE: 'EAL',
  SLOW_PROCESSING: 'SLP',
  VISUAL_IMPAIRMENTS: 'VIM',
  OTHER: 'OTH'
})

/**
 * Find question reader reasons
 * @returns {Promise<Array>}
 */
questionReaderReasonsDataService.sqlFindQuestionReaderReasons = async function () {
  const sql = `
  SELECT 
    id, 
    code, 
    description
  FROM ${sqlService.adminSchema}.[questionReaderReasons]
  ORDER BY displayOrder ASC`
  return sqlService.query(sql)
}

/**
 * Find question reader reason by code
 * @returns {Promise<Array>}
 */
questionReaderReasonsDataService.sqlFindQuestionReaderReasonIdByCode = async function (code) {
  if (Object.keys(questionReaderCodes).length === 0) {
    // init
    await init()
  }
  if (!questionReaderCodes[code]) {
    throw new Error('Code does not exist')
  }
  return questionReaderCodes[code]
}

/**
 * Initialise method to populate accessArrangementCodes for caching purposes
 * @returns {Array}
 */
const init = async () => {
  let questionReaderReasons
  const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.[questionReaderReasons]`

  questionReaderReasons = await sqlService.query(sql)
  questionReaderReasons.map(qrr => {
    questionReaderCodes[qrr.code] = qrr.id
  })
}

module.exports = monitor('question-reader-reason.data-service', questionReaderReasonsDataService)
