'use strict'
const sqlService = require('less-tedious')
const R = require('ramda')

const config = require('../../../config')
sqlService.initialise(config)

const psychometricianReportDataService = {
  sqlFindAllPsychometricianReports: async function sqlFindAllPsychometricianReports () {
    const sql = 'SELECT * from [mtc_admin].[psychometricianReportCache]'
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
  },

  sqlFindAllAnomalyReports: async function sqlFindAllPsychometricianReports () {
    const sql = 'SELECT * from [mtc_admin].[anomalyReportCache]'
    const results = await sqlService.query(sql)
    const parsed = results.map(x => {
      const d = JSON.parse(x.jsonData)
      return R.assoc('jsonData', d, x)
    })
    return parsed
  }
}

module.exports = psychometricianReportDataService
