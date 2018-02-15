'use strict'
const {TYPES} = require('tedious')

const sqlService = require('./sql.service')

const table = '[answer]'

const answerDataService = {
  sqlUpdateWithResults: async (checkId, answers) => {
    if (!answers || !Array.isArray(answers)) {
      throw new Error('answers not provided')
    }
    const insertSql = `INSERT INTO ${sqlService.adminSchema}.${table} (
      check_id, 
      questionNumber, 
      factor1,
      factor2,
      answer,
      isCorrect
      ) VALUES`

    const inserts = []
    const params = []

    answers.forEach((answer, idx) => {
      inserts.push(`(@checkId${idx}, @questionNumber${idx}, @factor1${idx}, @factor2${idx}, @answer${idx}, @isCorrect${idx})`)
      params.push({
        name: `checkId${idx}`,
        value: checkId,
        type: TYPES.Int
      })
      params.push({
        name: `questionNumber${idx}`,
        value: answer.questionNumber,
        type: TYPES.SmallInt
      })
      params.push({
        name: `factor1${idx}`,
        value: answer.factor1,
        type: TYPES.SmallInt
      })
      params.push({
        name: `factor2${idx}`,
        value: answer.factor2,
        type: TYPES.SmallInt
      })
      params.push({
        name: `answer${idx}`,
        value: answer.answer,
        type: TYPES.NVarChar
      })
      params.push({
        name: `isCorrect${idx}`,
        value: answer.isCorrect,
        type: TYPES.Bit
      })
    })
    const sql = [insertSql, inserts.join(', \n')].join(' ')
    return sqlService.modify(sql, params)
  },

  /**
   * Find all answers that match the supplied array of checkIds
   * Used in processing the psychometric report
   * @param checkIds
   * @return {Promise<*>}
   */
  sqlFindByCheckIds: async (checkIds) => {
    const select = `SELECT * FROM ${sqlService.adminSchema}.${table} WHERE check_id IN`
    const whereParams = sqlService.buildParameterList(checkIds, TYPES.Int)
    const sql = [select, '(', whereParams.paramIdentifiers, ')'].join(' ')
    const results = await sqlService.query(sql, whereParams.params)
    const byCheckId = {}
    results.forEach((answer, idx) => {
      if (!byCheckId[answer.check_id]) {
        byCheckId[answer.check_id] = []
      }
      byCheckId[answer.check_id].push(answer)
    })
    return byCheckId
  }
}

module.exports = answerDataService
