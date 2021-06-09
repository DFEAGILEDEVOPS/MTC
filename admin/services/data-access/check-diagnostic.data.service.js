'use strict'

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
const R = require('ramda')
const roles = require('../../lib/consts/roles')

const service = {
  getByCheckCode: async function getByCheckCode (checkCode) {
    const sql = 'SELECT * FROM mtc_admin.vewCheckDiagnostic WHERE checkCode=@checkCode'
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const result = await sqlService.query(sql, params, undefined, roles.techSupport)
    return R.head(result)
  },

  getResultsAnswersJsonByCheckCode: async function getResultsDataByCheckCode (checkCode) {
    const sql = `
      SELECT q.factor1 as [factor1], q.factor2 as [factor2], ans.answer as [answer], ans.questionNumber as [sequenceNumber],
      CONCAT(q.factor1, 'x', q.factor2) as [question],
      ans.browserTimestamp as [clientTimestamp]
      FROM mtc_results.[answer] ans
      INNER JOIN [mtc_admin].[question] q ON q.id = ans.question_id
      INNER JOIN [mtc_results].[checkResult] cr ON ans.checkResult_id = cr.id
      INNER JOIN [mtc_admin].[check] chk ON chk.id = cr.check_id
      WHERE chk.checkCode = @checkCode
      FOR JSON PATH, ROOT('answers')`
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const result = await sqlService.query(sql, params, undefined, roles.techSupport)
    return R.head(result)
  },

  getResultsQuestionsJsonByCheckCode: async function getResultsQuestionsJsonByCheckCode (checkCode) {
    const sql = `
      SELECT ans.questionNumber as [order], q.factor1 as [factor1], q.factor2 as [factor2]
      FROM mtc_results.[answer] ans
      INNER JOIN [mtc_admin].[question] q ON q.id = ans.question_id
      INNER JOIN [mtc_results].[checkResult] cr ON ans.checkResult_id = cr.id
      INNER JOIN [mtc_admin].[check] chk ON chk.id = cr.check_id
      WHERE chk.checkCode = @checkCode
      FOR JSON PATH, ROOT('questions')`
    const params = [
      {
        name: 'checkCode',
        value: checkCode,
        type: TYPES.UniqueIdentifier
      }
    ]
    const result = await sqlService.query(sql, params, undefined, roles.techSupport)
    return R.head(result)
  }
}

module.exports = service
