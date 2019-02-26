'use strict'
const R = require('ramda')
const sqlService = require('./sql.service')

const psychometricianReportDataService = {
  getLatest: async function getLatest () {
    const sql = `select TOP (1) bf.*
                 from [mtc_admin].[azureBlobFile] bf JOIN
                      [mtc_admin].[azureBlobFileType] ft ON (bf.azureBlobFileType_id = bf.id)
                 where ft.code = 'PSR'
                 order by bf.id desc`
    const res = await sqlService.query(sql)
    return R.head(res)
  }
}

module.exports = psychometricianReportDataService
