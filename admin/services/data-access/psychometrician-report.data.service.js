'use strict'
const R = require('ramda')
const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES

const psychometricianReportDataService = {
  /**
   * Get latest report meta info
   * @return {Promise<object>}
   */
  getLatest: async function getLatest () {
    const sql = `select TOP (1) bf.*
                 from [mtc_admin].[azureBlobFile] bf JOIN
                      [mtc_admin].[azureBlobFileType] ft ON (bf.azureBlobFileType_id = ft.id)
                 where ft.code = 'PSR'
                 order by bf.id desc`
    const res = await sqlService.query(sql)
    return R.head(res)
  },

  /**
   * Fetch report meta info by URL Slug
   * @param urlSlug
   * @return {Promise<object>}
   */
  sqlGetByUrlSlug: async function sqlGetByUrlSlug (urlSlug) {
    const sql = `select bf.*
                 from [mtc_admin].[azureBlobFile] bf JOIN
                      [mtc_admin].[azureBlobFileType] ft ON (bf.azureBlobFileType_id = ft.id)
                 where ft.code = 'PSR'
                 and urlSlug = @urlSlug`
    const params = [
      { name: 'urlSlug', value: urlSlug, type: TYPES.UniqueIdentifier }
    ]
    const res = await sqlService.query(sql, params)
    return R.head(res)
  }
}

module.exports = psychometricianReportDataService
