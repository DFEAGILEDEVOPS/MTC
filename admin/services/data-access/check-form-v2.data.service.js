'use strict'

const R = require('ramda')
const { TYPES } = require('tedious')

const sqlService = require('./sql.service')

const table = '[checkForm]'

const checkFormV2DataService = {
  /**
   * Find existing check forms
   * @returns {Promise<*>}
   */
  sqlFindAllCheckForms: async () => {
    const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.${table}
    `
    return sqlService.query(sql)
  },
  sqlInsertCheckForms: async (checkFormData, isFamiliarisationCheckFormUpdate) => {
    const params = []
    const queries = []
    const inserts = []

    if (isFamiliarisationCheckFormUpdate) {
      queries.push(`DELETE ${sqlService.adminSchema}.${table} WHERE isLiveCheckForm = 0`)
    }

    checkFormData.forEach((cf, idx) => {
      inserts.push(`(@name${idx}, @formData${idx}, @isLiveCheckForm${idx})`)
      params.push({
        name: `name${idx}`,
        value: cf.name,
        type: TYPES.NVarChar
      })
      params.push({
        name: `formData${idx}`,
        value: cf.formData,
        type: TYPES.NVarChar
      })
      params.push({
        name: `isLiveCheckForm${idx}`,
        value: cf.isLiveCheckForm,
        type: TYPES.Bit
      })
    })

    const insertSql = `INSERT INTO ${sqlService.adminSchema}.${table} (
      name,
      formData,
      isLiveCheckForm
      ) VALUES`

    queries.push([insertSql, inserts.join(', \n')].join(' '))
    const sql = queries.join('\n')
    return sqlService.modify(sql, params)
  },

  sqlFindFamiliarisationCheckForm: async () => {
    const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isLiveCheckForm = 0`
    const result = await sqlService.query(sql)
    return R.head(result)
  },

  sqlDeleteFamiliarisationCheckForm: async () => {
    const sql = `
    DELETE FROM ${sqlService.adminSchema}.${table}
    WHERE isLiveCheckForm = 0`
    return sqlService.modify(sql)
  }
}

module.exports = checkFormV2DataService
