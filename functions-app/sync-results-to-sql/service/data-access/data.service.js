'use strict'

const R = require('ramda')

const base = require('../../../lib/logger')
const sqlService = require('../../../lib/sql/sql.service')
const questionIndex = {}

const service = {
  /**
   * Return an indexed object of all the live questions 1x1 to 12x12 - includes warmup questions which are distinct
   * Data is cached once retrieved
   * @return {Promise<Readonly<{}>}  { '1x1': {id: 145, factor1: 1, factor2: 1, isWarmUp: false, code: 'Q001' }, ... }
   */
  sqlGetQuestionData: async function sqlGetQuestionData () {
    if (R.isEmpty(questionIndex)) {
      const sql = 'SELECT id, factor1, factor2, code, isWarmup FROM mtc_admin.question'
      const data = await sqlService.query(sql)
      // index the data by f1xf2
      data.forEach(o => {
        if (o.isWarmup === false) {
          questionIndex[`${o.factor1}x${o.factor2}`] = Object.freeze(o)
        }
      })
    }
    return Object.freeze(questionIndex)
  }
}

module.exports = Object.assign(service, base)
