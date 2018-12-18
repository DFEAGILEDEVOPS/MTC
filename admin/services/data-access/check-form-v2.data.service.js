'use strict'

const R = require('ramda')
const { TYPES } = require('tedious')

const sqlService = require('./sql.service')

const table = '[checkForm]'

const checkFormV2DataService = {

  /**
   * Find all non deleted check forms
   * @returns {Promise<*>}
   */
  sqlFindActiveCheckForms: async () => {
    const sql = `
    SELECT
    cF.*,
    cW.id AS currentCheckWindow_id,
    cW.name AS currentCheckWindowName
    FROM ${sqlService.adminSchema}.${table} cF
    LEFT JOIN ${sqlService.adminSchema}.checkFormWindow cFW
      ON cF.id = cFW.checkForm_id AND cF.isDeleted = 0
    LEFT JOIN ${sqlService.adminSchema}.checkWindow cW
      ON cW.id = cFW.checkWindow_id 
        AND GETUTCDATE() > cW.adminStartDate
        AND GETUTCDATE() < cW.adminEndDate`
    return sqlService.query(sql)
  },

  /**
   * Deletes if required existing familiarisation form and inserts checkform(s)
   * @param {Array} checkFormData
   * @param {Boolean} isFamiliarisationCheckFormUpdate
   * @returns {Promise<*>}
   */
  sqlInsertCheckForms: async (checkFormData, isFamiliarisationCheckFormUpdate) => {
    const params = []
    const queries = []
    const inserts = []

    if (isFamiliarisationCheckFormUpdate) {
      queries.push(`UPDATE ${sqlService.adminSchema}.${table} SET isDeleted = 1 WHERE isLiveCheckForm = 0`)
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
    return sqlService.query(sql, params)
  },

  /**
   * Finds existing familiarisation check form
   * @returns {Object}
   */
  sqlFindFamiliarisationCheckForm: async () => {
    const sql = `
    SELECT *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isLiveCheckForm = 0
    AND isDeleted = 0`
    const result = await sqlService.query(sql)
    return R.head(result)
  },

  /**
   * Mark check form as deleted
   * @param {String} urlSlug
   * @returns {Promise<*>}
   */
  sqlMarkDeletedCheckForm: async (urlSlug) => {
    const sql = `UPDATE ${sqlService.adminSchema}.${table}
    SET isDeleted = 1 WHERE urlSlug = @urlSlug`
    const params = [
      {
        name: 'urlSlug',
        value: urlSlug,
        type: TYPES.NVarChar
      }
    ]

    return sqlService.modify(sql, params)
  },

  /**
   * Finds check form by urlSlug
   * @param {String} urlSlug
   * @returns {Promise<*>}
   */
  sqlFindCheckFormByUrlSlug: async (urlSlug) => {
    const sql = `SELECT cF.*,
    cW.id AS currentCheckWindow_id,
    cW.name AS currentCheckWindowName,
    cW.adminStartDate,
    cW.adminEndDate
    FROM ${sqlService.adminSchema}.${table} cF
    LEFT JOIN ${sqlService.adminSchema}.checkFormWindow cFW
      ON cF.id = cFW.checkForm_id
    LEFT JOIN ${sqlService.adminSchema}.checkWindow cW
      ON cFW.checkWindow_id = cW.id
      AND GETUTCDATE() > cW.adminStartDate
      AND GETUTCDATE() < cW.adminEndDate
    WHERE cF.urlSlug = @urlSlug
    AND cF.isDeleted = 0`
    const params = [
      {
        name: 'urlSlug',
        value: urlSlug,
        type: TYPES.NVarChar
      }
    ]
    const result = await sqlService.query(sql, params)
    return R.head(result)
  }
}

module.exports = checkFormV2DataService
