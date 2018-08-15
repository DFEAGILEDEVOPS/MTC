'use strict'
const sqlService = require('./sql.service')
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

module.exports = questionReaderReasonsDataService
