'use strict'

const R = require('ramda')

const base = require('../../lib/logger')
const dataService = require('./data-access/data.service')
const { TYPES } = require('../../lib/sql/sql.service')

const service = {
  getQuestionData: function sqlGetQuestionData () {
    return dataService.sqlGetQuestionData()
  },

  prepareCheckResult: function prepareCheckResult (markedCheck) {
    console.log('prepareCheckResult: ', markedCheck)
    const sql = `
        DECLARE @checkId Int;
        DECLARE @checkResultId Int;

        SET @checkId = (SELECT id
                          FROM mtc_admin.[check]
                         WHERE checkCode = @checkCode);
        IF (@checkId IS NULL) THROW 510001, 'Check ID not found', 1;

        INSERT INTO mtc_results.checkResult (check_id, mark, markedAt)
        VALUES (@checkId, @mark, @markedAt);

        SET @checkResultId = (SELECT SCOPE_IDENTITY());
    `
    const params = [
      { name: 'checkCode', value: markedCheck.checkCode, type: TYPES.UniqueIdentifier },
      { name: 'mark', value: markedCheck.mark, type: TYPES.TinyInt },
      { name: 'markedAt', value: markedCheck.markedAt, type: TYPES.DateTimeOffset }
    ]
    return [sql, params]
  },

  prepareAnswers: function prepareAnswers (markedCheck, questionHash) {
    const answerSql = markedCheck.markedAnswers.map((o, j) => {
      return `INSERT INTO mtc_results.[answer] (checkResult_id, questionNumber, answer,  question_id, isCorrect, browserTimestamp) VALUES
                  (@checkResultId, @answerQuestionNumber${j}, @answer${j},  @answerQuestionId${j}, @answerIsCorrect${j}, @answerBrowserTimestamp${j});`
    })

    const params = markedCheck.markedAnswers.map((o, j) => {
      const question = questionHash[o.question]
      if (!question) {
        throw new Error(`Unable to find valid question for [${o.question}] from checkCode [${markedCheck.checkCode}]`)
      }
      return [
        { name: `answerQuestionNumber${j}`, value: o.sequenceNumber, type: TYPES.SmallInt },
        { name: `answer${j}`, value: o.answer, type: TYPES.NVarChar },
        { name: `answerQuestionId${j}`, value: question.id, type: TYPES.Int },
        { name: `answerIsCorrect${j}`, value: o.isCorrect, type: TYPES.Bit },
        { name: `answerBrowserTimestamp${j}`, value: o.clientTimestamp, type: TYPES.DateTimeOffset }
      ]
    })

    return [answerSql.join('\n'), R.flatten(params)]
  }
}

module.exports = Object.assign(service, base)
