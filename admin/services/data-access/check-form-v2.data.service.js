'use strict'

const R = require('ramda')
const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')

const table = '[checkForm]'

const checkFormV2DataService = {

  /**
   * Find all non deleted check forms with the at least one associated check window
   * @returns {Promise<*>}
   */
  sqlFindActiveCheckForms: async () => {
    const sql = `
    SELECT
      cF.*,
      checkFormRanked.checkWindow_id,
      checkFormRanked.checkWindowName
    FROM ${sqlService.adminSchema}.${table} cF
    LEFT JOIN (
        SELECT cF2.*, cFW.checkWindow_id, cW.name AS checkWindowName, ROW_NUMBER() OVER (PARTITION BY cF2.id ORDER BY cW.id ASC) as rank
        FROM ${sqlService.adminSchema}.${table} cF2
        LEFT JOIN ${sqlService.adminSchema}.checkFormWindow cFW
          ON cF2.id = cFW.checkForm_id
        LEFT JOIN ${sqlService.adminSchema}.checkWindow cW
          ON cW.id = cFW.checkWindow_id
        ) checkFormRanked
      ON cF.id = checkFormRanked.id
    WHERE (checkFormRanked.rank = 1 OR checkFormRanked.rank IS NULL)
    AND cF.isDeleted = 0
    ORDER BY cf.name ASC`
    return sqlService.query(sql)
  },

  /**
   * Find all check forms with the at least one associated check window
   * @returns {Promise<*>}
   */
  sqlFindAllCheckForms: async () => {
    const sql = `
    SELECT
      cF.*,
      checkFormRanked.checkWindow_id,
      checkFormRanked.checkWindowName
    FROM ${sqlService.adminSchema}.${table} cF
    LEFT JOIN (
        SELECT cF2.*, cFW.checkWindow_id, cW.name AS checkWindowName, ROW_NUMBER() OVER (PARTITION BY cF2.id ORDER BY cW.id ASC) as rank
        FROM ${sqlService.adminSchema}.${table} cF2
        LEFT JOIN ${sqlService.adminSchema}.checkFormWindow cFW
          ON cF2.id = cFW.checkForm_id
        LEFT JOIN ${sqlService.adminSchema}.checkWindow cW
          ON cW.id = cFW.checkWindow_id
        WHERE GETUTCDATE() <= cW.checkEndDate
        ) checkFormRanked
      ON cF.id = checkFormRanked.id
    WHERE (checkFormRanked.rank = 1 OR checkFormRanked.rank IS NULL)
    ORDER BY cf.name ASC`
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
    return sqlService.modify(sql, params)
  },

  /**
   * Finds existing familiarisation check form
   * @returns {Promise<Object>}
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
    checkFormRanked.checkWindow_id,
    checkFormRanked.checkWindowName,
    checkFormRanked.checkWindowAdminStartDate,
    checkFormRanked.checkWindowAdminEndDate
    FROM ${sqlService.adminSchema}.${table} cF
    LEFT JOIN (
        SELECT
          cF2.*,
          cFW.checkWindow_id,
          cW.name AS checkWindowName,
          cW.adminStartDate AS checkWindowAdminStartDate,
          cW.adminEndDate AS checkWindowAdminEndDate,
          ROW_NUMBER() OVER (PARTITION BY cF2.id ORDER BY cW.id ASC) as rank
        FROM ${sqlService.adminSchema}.${table} cF2
        LEFT JOIN ${sqlService.adminSchema}.checkFormWindow cFW
          ON cF2.id = cFW.checkForm_id AND cF2.isDeleted = 0
        LEFT JOIN ${sqlService.adminSchema}.checkWindow cW
          ON cW.id = cFW.checkWindow_id
        ) checkFormRanked
      ON cF.id = checkFormRanked.id
    WHERE (checkFormRanked.rank = 1 OR checkFormRanked.rank IS NULL)
    AND cF.urlSlug = @urlSlug
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
  },

  /**
   * Finds check form by urlSlugs
   * @param {Array} urlSlugs
   * @returns {Promise<*>}
   */
  sqlFindCheckFormsByUrlSlugs: async (urlSlugs) => {
    const select = `SELECT *
    FROM ${sqlService.adminSchema}.${table}
    `
    const { params, paramIdentifiers } = sqlService.buildParameterList(urlSlugs, TYPES.UniqueIdentifier)
    const whereClause = 'WHERE urlSlug IN (' + paramIdentifiers.join(', ') + ')'
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  },

  /**
   * Finds check forms by check form type
   * @param {Boolean} isLiveCheckForm
   * @returns {Promise<*>}
   */
  sqlFindActiveCheckFormsByType: async (isLiveCheckForm) => {
    const sql = `SELECT *
    FROM ${sqlService.adminSchema}.${table}
    WHERE isDeleted = 0
    AND isLiveCheckForm = @isLiveCheckForm`
    const params = [
      {
        name: 'isLiveCheckForm',
        value: isLiveCheckForm,
        type: TYPES.Bit
      }
    ]
    return sqlService.query(sql, params)
  },

  /**
   * Finds check forms by check window url slug and check form type
   * @param {Number} checkWindowId
   * @param {Boolean} isLiveCheckForm
   * @returns {Promise<*>}
   */
  sqlFindCheckFormsByCheckWindowIdAndType: async (checkWindowId, isLiveCheckForm) => {
    const sql = `SELECT cf.*
      FROM ${sqlService.adminSchema}.${table} cf
      INNER JOIN ${sqlService.adminSchema}.[checkFormWindow] fw
          ON cf.id = fw.checkForm_id
      INNER JOIN ${sqlService.adminSchema}.[checkWindow] cw
        ON cw.id = fw.checkWindow_id
      WHERE cf.isDeleted=0
      AND fw.checkWindow_id= @checkWindowId
      AND cf.isLiveCheckForm = @isLiveCheckForm
      ORDER BY cw.[name] ASC`
    const params = [
      {
        name: 'isLiveCheckForm',
        value: isLiveCheckForm,
        type: TYPES.Bit
      },
      {
        name: 'checkWindowId',
        value: checkWindowId,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  },

  /**
   * Delete existing and assign new forms to check window
   * @param {Number} checkWindowId
   * @param {Boolean} isLiveCheckForm
   * @param {Array} checkForms
   * @returns {Promise<*>}
   */
  sqlAssignFormsToCheckWindow: async (checkWindowId, isLiveCheckForm, checkForms) => {
    const params = []
    const queries = []

    params.push({
      name: 'isLiveCheckForm',
      value: isLiveCheckForm ? 1 : 0,
      type: TYPES.Bit
    })
    params.push({
      name: 'checkWindowId',
      value: checkWindowId,
      type: TYPES.Int
    })
    queries.push(`DELETE fw
    FROM ${sqlService.adminSchema}.[checkFormWindow] fw
    INNER JOIN ${sqlService.adminSchema}.[checkForm] cf
      ON cf.id = fw.checkForm_id
    WHERE cf.isLiveCheckForm = @isLiveCheckForm
    AND fw.checkWindow_id = @checkWindowId`)

    const inserts = []
    checkForms.forEach((cf, idx) => {
      inserts.push(`(@checkForm_id${idx}, @checkWindow_id${idx})`)
      params.push({
        name: `checkForm_id${idx}`,
        value: cf.id,
        type: TYPES.Int
      })
      params.push({
        name: `checkWindow_id${idx}`,
        value: checkWindowId,
        type: TYPES.Int
      })
    })
    const insertSql = `INSERT INTO ${sqlService.adminSchema}.[checkFormWindow] (
    checkForm_id,
    checkWindow_id
    ) VALUES`

    queries.push([insertSql, inserts.join(', \n')].join(' '))
    const sql = queries.join('\n')
    return sqlService.modifyWithTransaction(sql, params)
  },

  /**
   * Find existing familiarisation form for check window
   * @param {Number} checkWindowId
   * @returns {Promise<*>}
   */
  sqlFindCheckWindowFamiliarisationCheckForm: async (checkWindowId) => {
    const sql = `SELECT TOP 1 cfw.* FROM ${sqlService.adminSchema}.checkFormWindow cfw
      LEFT JOIN ${sqlService.adminSchema}.checkForm cf
        ON cfw.checkForm_id = cf.id
      LEFT JOIN ${sqlService.adminSchema}.checkWindow cw
        ON cfw.checkWindow_id = cw.id
      WHERE cw.id = @checkWindowId
      AND cf.isLiveCheckForm = 0`

    const params = [
      {
        name: 'checkWindowId',
        value: checkWindowId,
        type: TYPES.Int
      }
    ]
    const result = await sqlService.query(sql, params)
    return R.head(result)
  },

  /**
   * Delete existing familiarisation form from check window
   * @param {Number} checkWindowId
   * @returns {Promise<*>}
   */
  sqlUnassignFamiliarisationForm: async (checkWindowId) => {
    const sql = `DELETE cfw FROM ${sqlService.adminSchema}.checkFormWindow cfw
      LEFT JOIN ${sqlService.adminSchema}.checkForm cf
        ON cfw.checkForm_id = cf.id
      LEFT JOIN ${sqlService.adminSchema}.checkWindow cw
        ON cfw.checkWindow_id = cw.id
      WHERE cw.id = @checkWindowId
      AND cf.isLiveCheckForm = 0`

    const params = [
      {
        name: 'checkWindowId',
        value: checkWindowId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify(sql, params)
  }
}

module.exports = checkFormV2DataService
