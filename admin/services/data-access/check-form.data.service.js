'use strict'

const CheckForm = require('../../models/check-form')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const moment = require('moment')
const winston = require('winston')

const checkFormDataService = {
  /**
   * Get form by id (if passed), when isDeleted is false.
   * Return Mongoose object.
   * @deprecated use sqlFindActiveForm
   * @param id
   */
  getActiveForm: (id) => {
    winston.warn('check-form.data.service.getActiveForm is deprecated')
    let query = {'isDeleted': false}
    if (id) {
      query = Object.assign(query, {'_id': id})
    }
    return CheckForm.findOne(query).exec()
  },

    /**
   * Get active forms
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlFindActiveForm: (id = undefined) => {
    let sql = 'SELECT TOP 1 * FROM [mtc_admin].[checkForm] WHERE isDeleted=0'
    return sqlService.query(sql)
  },

  /**
   * Get active form by id
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlFindActiveFormById: (id) => {
    let sql = 'SELECT TOP 1 * FROM [mtc_admin].[checkForm] WHERE isDeleted=0'
    const params = []
    if (id) {
      sql += ' AND [id]=@id'
      params.push({
        name: 'id',
        value: id,
        type: TYPES.Int
      })
    }
    return sqlService.query(sql, params)
  },

  /**
   * Get check form when isDeleted is false.
   * Return plain javascript object.
   * This method will not be refactored as all calls should be repointed to sqlFindActiveFormById.
   * @deprecated use sqlFindActiveFormById
   * @returns {Promise}
   */
  getActiveFormPlain: (id) => {
    winston.warn('check-form.data.service.getActiveFormPlain is deprecated')
    let query = {'isDeleted': false}
    if (id) {
      query = Object.assign(query, {'_id': id})
    }
    return CheckForm.findOne(query).lean().exec()
  },

  /**
   * Fetch active forms (forms not soft-deleted)
   * @param query
   * @param sortField
   * @param sortDirection
   * @deprecated use sqlFetchSortedActiveFormsByName
   * @returns {Promise.<void>}
   */
  fetchSortedActiveForms: async (query, sortField, sortDirection) => {
    let sort = {}
    let q = query
    winston.warn('check-form.data.service.fetchSortedActiveForms is deprecated')
    if (sortField && sortDirection) {
      sort[sortField] = sortDirection
    }
    q.isDeleted = false
    return CheckForm.find(q).sort(sort).lean().exec()
  },

  /**
   * Fetch active forms (not deleted)
   * sorted by name
   * @param windowId only forms assigned to the specified window (optional)
   * @param sortDescending if true, sorts descending
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveFormsByName: (windowId, sortDescending) => {
    let sortOrder = 'ASC'
    if (sortDescending) {
      sortOrder = 'DESC'
    }
    const params = []
    let sql = ''
    if (windowId) {
      sql = `SELECT * FROM [mtc_admin].[checkForm] WHERE isDeleted=0 
      AND [id] IN (SELECT checkForm_id FROM checkFormWindow 
        WHERE checkWindow_id=@windowId)  ORDER BY [name] ${sortOrder}`
      params.push({
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      })
    } else {
      sql = `SELECT * FROM [mtc_admin].[checkForm] WHERE isDeleted=0 ORDER BY [name] ${sortOrder}`
    }
    return sqlService.query(sql, params)
  },

  sqlFetchSortedActiveFormsNotAssignedToWindowByName: (windowId) => {
    const params = [{
      name: 'windowId',
      value: windowId,
      type: TYPES.Int
    }]
    const sql = `SELECT * FROM [mtc_admin].[checkForm] WHERE isDeleted=0 
      AND [id] NOT IN (SELECT DISTINCT checkForm_id FROM checkFormWindow 
      WHERE checkWindow_id =@windowId) ORDER BY [name]`
    return sqlService.query(sql, params)
  },

    /**
   * Fetch active forms (not deleted)
   * sorted by window
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveFormsByWindow: (windowId, sortDescending) => {
    let sortOrder = 'ASC'
    if (sortDescending) {
      sortOrder = 'DESC'
    }
    const params = []
    let sql
    if (windowId) {
      sql = `SELECT cf.*, cw.[name] FROM [mtc_admin].[checkForm] cf
      INNER JOIN [mtc_admin].[checkFormWindow] fw
          ON cf.id = fw.checkForm_id
      INNER JOIN [mtc_admin].[checkWindow] cw
        ON cw.id = fw.checkWindow_id
      WHERE cf.isDeleted=0 AND fw.checkWindow_id=@windowId
      ORDER BY cw.[name] ${sortOrder}`
      params.push({
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      })
    } else {
      sql = `SELECT DISTINCT cf.id, cf.[name], cf.isDeleted FROM [mtc_admin].[checkForm] cf
      LEFT OUTER JOIN [mtc_admin].[checkFormWindow] fw
          ON cf.id = fw.checkForm_id
      LEFT OUTER JOIN [mtc_admin].[checkWindow] cw
        ON cw.id = fw.checkWindow_id
      ORDER BY cf.name ${sortOrder}`
    }
    return sqlService.query(sql, params)
  },

  /**
   * Create.
   * @param data
   * @deprecated use sqlCreate
   * @returns {Promise<*>}
   */
  create: async (data) => {
    winston.warn('check-form.data.service.create is deprecated')
    const checkForm = new CheckForm(data)
    await checkForm.save()
    return checkForm.toObject()
  },

    /**
   * Create check form
   * @param checkForm
   * @returns {Promise<*>}
   */
  sqlCreate: (checkForm) => {
    return sqlService.create('[checkForm]', checkForm)
  },

  /**
   * Find check form by name.
   * @param formName
   * @deprecated use sqlFindCheckFormByName
   * @returns {Promise|*}
   */
  findCheckFormByName: (formName) => {
    winston.warn('check-form.data.service.findCheckFormByName is deprecated')
    let query = { 'isDeleted': false, 'name': formName }
    return CheckForm.findOne(query).lean().exec()
  },

    /**
   * Find check form by name.
   * @param formName
   * @returns {Promise|*}
   */
  sqlFindCheckFormByName: (formName) => {
    const sql = 'SELECT * FROM [mtc_admin].[checkForm] WHERE isDeleted=0 AND [name]=@name'
    const params = [{
      name: 'name',
      value: formName,
      type: TYPES.NVarChar
    }]
    return sqlService.query(sql, params)
  },

  /**
   * assigns a check form to a window
   */
  sqlAssignFormToWindow: async (formId, windowId) => {
    return sqlService.create('[checkFormWindow]', { checkForm_id: formId, checkWindow_id: windowId })
  },

  sqlRemoveWindowAssignment: (formId, windowId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      },
      {
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      }
    ]
    sqlService.modify('DELETE [mtc_admin].[checkFormWindow] WHERE checkForm_id=@formId AND checkWindow_id=@windowId', params)
  },

  sqlRemoveAllWindowAssignments: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify('DELETE [mtc_admin].[checkFormWindow] WHERE checkForm_id=@formId', params)
  },

  sqlIsAssignedToWindows: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      }
    ]
    const result = sqlService.query('SELECT COUNT(*) FROM [mtc_admin].[checkFormWindow] WHERE checkForm_id=@formId', params)
    // HACK test object structure
    return result.value > 0
  },

  sqlDeleteForm: async (formId) => {
    const params = [
      {
        name: 'formId',
        value: formId,
        type: TYPES.Int
      },
      {
        name: 'updatedAt',
        value: moment.utc(),
        type: TYPES.DateTimeOffset
      }
    ]
    return sqlService.modify('UPDATE [mtc_admin].[checkForm] SET isDeleted=1, updatedAt=@updatedAt WHERE [id]=@formId', params)
  }
}

module.exports = checkFormDataService
