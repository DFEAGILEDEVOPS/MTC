'use strict'

const R = require('ramda')

const sqlService = require('../../../lib/sql/sql.service')
const questionIndex = {}
const { TYPES } = sqlService
const name = 'sync-results-to-sql:data.service.js'

const service = {
  /**
   * Return data for checks that are complete but results are missing from SQL DB
   * @param {number} schoolId
   * @return {Promise<{ id: number, checkCode: string}[]>}
   */
  sqlGetNewChecks: async function sqlGetNewChecks (schoolId) {
    const sql = `SELECT c.id, c.checkCode
                   FROM mtc_admin.[check] c
                        JOIN      mtc_admin.[pupil] p ON (c.pupil_id = p.id)
                        JOIN      mtc_admin.[school] s ON (p.school_id = s.id)
                        LEFT JOIN mtc_admin.[checkScore] cs ON (cs.checkId = c.id)
                  WHERE s.id = @schoolId
                    AND c.complete = 1
                    AND cs.id IS NULL`
    return sqlService.query(sql, [{ name: 'schoolId', value: schoolId, type: TYPES.Int }])
  },

  /**
   * Find schools that have new checks to process
   * @return {Promise<{id: number, name: string, schoolGuid: string}>}
   */
  sqlGetSchoolsWithNewChecks: async function sqlGetSchoolsWithNewChecks () {
    const sql = `SELECT DISTINCT (s.id), s.name, s.urlSlug as schoolGuid
                   FROM mtc_admin.[check] c
                        JOIN      mtc_admin.[pupil] p ON (c.pupil_id = p.id)
                        JOIN      mtc_admin.[school] s ON (p.school_id = s.id)
                        LEFT JOIN mtc_admin.[checkScore] cs ON (cs.checkId = c.id)
                  WHERE c.complete = 1
                    AND cs.id IS NULL`
    return sqlService.query(sql)
  },

  /**
   * Return an indexed object of all the questions 1x1 to 12x12 - includes warmup questions which are distinct
   * Data is cached once retrieved
   * @return {Promise<{object}>}  { '1x1': {id: 145, factor1: 1, factor2: 1, isWarmUp: false, code: 'Q001' }, ... }
   */
  sqlGetQuestionData: async function sqlGetQuestionData () {
    if (R.isEmpty(questionIndex)) {
      const sql = 'SELECT id, factor1, factor2, code, isWarmup from mtc_admin.question'
      const data = await sqlService.query(sql)
      // index the data by f1xf2
      data.forEach(o => {
        if (o.isWarmup === false) {
          questionIndex[`${o.factor1}x${o.factor2}`] = o
        }
      })
    }
    return questionIndex
  },

  /**
   * Persist marking data to the DB. Operates on a per-check basis.
   * @param {MarkedCheck[]} markedChecks
   * @return {Promise<void>}
   */
  sqlSaveMarkingData: async function sqlSaveMarkingData (markedChecks) {
    console.log('checks and marking data', markedChecks)

    function generateInsertStatements (i, o) {
      const sql = `
        DECLARE @checkId${i} Int;
        SET @checkId${i} = (SELECT id from mtc_admin.[check] WHERE checkCode = @checkCode${i});
        IF (@checkId${i} IS NULL) 
          THROW 510001, 'Check ID not found', 1;
            
        INSERT INTO mtc_admin.[checkScore] (checkId, mark, markedAt) VALUES (@checkId${i}, @mark${i}, @markedAt${i});        
        `
      const answerSql = o.markedAnswers.map((o, j) => {
        return `INSERT INTO mtc_admin.[answer] (answer, check_id, isCorrect, question_id, questionNumber) VALUES 
                (@answer${i}_${j}, @checkId${i}, @isCorrect${i}_${j}, @questionId${i}_${j}, @questionNumber${i}_${j});`
      })
      return sql.concat(answerSql.join('\n'))
    }

    /**
     * Generate an array of params
     * @param {Number} i
     * @param {MarkedCheck} o
     * @return {Promise<[{name: string, type: *, value: *}, {name: string, type: *, value: *}, {name: string, type: *, value: *}]>}
     */
    async function generateParams (i, o) {
      const params = [
        { name: `mark${i}`, value: o.mark, type: TYPES.Int },
        { name: `markedAt${i}`, value: o.markedAt, type: TYPES.DateTimeOffset },
        { name: `checkCode${i}`, value: o.checkCode, type: TYPES.UniqueIdentifier }
      ]
      let j = 0
      for (const ans of o.markedAnswers) {
        params.push({ name: `answer${i}_${j}`, value: ans.answer, type: TYPES.NVarChar })
        params.push({ name: `isCorrect${i}_${j}`, value: ans.isCorrect, type: TYPES.Bit })
        const question = await service.getQuestion(ans.question)
        params.push({ name: `questionId${i}_${j}`, value: question.id, type: TYPES.Int })
        params.push({ name: `questionNumber${i}_${j}`, value: ans.sequenceNumber, type: TYPES.SmallInt })
        j = j + 1
      }
      return params
    }

    let i = 0
    for (const o of markedChecks) {
      try {
        const sql = generateInsertStatements(i, o)
        const params = await generateParams(i, o)
        // save each individual check to the database
        await sqlService.modifyWithTransaction(sql, params)
      } catch (error) {
        console.error(`${name}: WARNING: error saving to database`, error)
        // If a single checks fails just log it and carry on saving the next check.  We don't
        // want bad data in one check rolling everything back.
      }
      i = i + 1
    }
  },

  /**
   * Return the question object from the question as string e.g.'6x7'
   * @param {string} idx e.g. '1x12'
   * @return {{id:number, factor1:number, factor2:number, code: string, isWarmup: boolean}|undefined}
   */
  getQuestion: async function getQuestion (idx) {
    const qi = await this.sqlGetQuestionData()
    return qi[idx]
  }
}

module.exports = service
