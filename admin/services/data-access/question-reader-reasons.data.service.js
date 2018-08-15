'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')
const questionReaderReasonsDataService = {}

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
questionReaderReasonsDataService.sqlFindQuestionReaderReasonByCode = async function (code) {
  const sql = `
  SELECT *
  FROM ${sqlService.adminSchema}.[questionReaderReasons]
  WHERE code = @code`
  const params = [
    { name: 'code', type: TYPES.Char, value: code }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

module.exports = monitor('question-reader-reason.data-service', questionReaderReasonsDataService)
