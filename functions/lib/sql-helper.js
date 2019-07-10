'use strict'

const R = require('ramda')
const sqlService = require('./sql/sql.service')
const { TYPES } = sqlService
const checkTable = '[check]'
const schema = '[mtc_admin]'

/**
 * Retrieve the checkFormAllocation data from the db
 * @param checkCode
 * @return {Promise<object>}
 */
module.exports.sqlFindCheckByCheckCode = async function (checkCode) {
  const sql = `SELECT TOP 1 chk.* , cs.code
               FROM ${schema}.${checkTable} chk JOIN
                    ${schema}.[checkStatus] cs ON (chk.checkStatus_id = cs.id)
               WHERE checkCode = @checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const res = await sqlService.query(sql, params)
  return R.head(res)
}

/**
 * Retrieve the checkFormAllocation data with relevant check form data from the db
 * @param checkCode
 * @return {Promise<object>}
 */
module.exports.sqlFindCheckWithFormDataByCheckCode = async function (checkCode) {
  const sql = `SELECT TOP 1 chk.* , cs.code AS checkStatusCode, f.formData
               FROM ${schema}.${checkTable} chk
               INNER JOIN ${schema}.[checkStatus] cs ON (chk.checkStatus_id = cs.id)
               INNER JOIN ${schema}.[checkForm] f ON chk.checkForm_id = f.id
               WHERE checkCode = @checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  const res = await sqlService.query(sql, params)
  return R.head(res)
}

/**
 * Update Check table with marking
 * @param {String} checkCode
 * @param {Number} mark
 * @param {Number} maxMark
 * @param {Moment} markedAt
 * @return {Promise<object>}
 */
module.exports.sqlUpdateCheckWithResults = async (checkCode, mark, maxMark, markedAt) => {
  const sql = `UPDATE [mtc_admin].[check]
  SET mark=@mark,
  maxMark=@maxMark,
  markedAt=@markedAt
  WHERE checkCode=@checkCode`

  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'mark',
      value: mark,
      type: TYPES.TinyInt
    },
    {
      name: 'maxMark',
      value: maxMark,
      type: TYPES.TinyInt
    },
    {
      name: 'markedAt',
      value: markedAt,
      type: TYPES.DateTimeOffset
    }
  ]
  return sqlService.modify(sql, params)
}

/**
 * Update Answers table with results from check
 * @param {Number} checkId
 * @param {Array} answers
 * @return {Promise<object>}
 */
module.exports.sqlUpdateAnswersWithResults = async (checkId, answers) => {
  const table = '[answer]'
  if (!answers || !Array.isArray(answers)) {
    throw new Error('answers not provided')
  }
  const insertSql = `INSERT INTO [mtc_admin].${table} (
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
}
