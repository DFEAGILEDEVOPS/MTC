'use strict'

const CheckForm = require('../../models/check-form')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const checkFormDataService = {
  /**
   * Get form by id (if passed), when isDeleted is false.
   * Return Mongoose object.
   * @param id
   */
  getActiveForm: (id) => {
    let query = {'isDeleted': false}
    if (id) {
      query = Object.assign(query, {'_id': id})
    }
    return CheckForm.findOne(query).exec()
  },

  /**
   * Get form by id (if passed), otherwise just an active form
   * This will be deprecated when the form choice algorithm is introduced
   * @param id
   * @returns {Promise<*>}
   */
  sqlGetActiveForm: (id) => {
    let sql = 'SELECT * FROM [mtc_admin].[checkForm] WHERE isDeleted=0'
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
   * @returns {Promise}
   */
  getActiveFormPlain: (id) => {
    let query = {'isDeleted': false}
    if (id) {
      query = Object.assign(query, {'_id': id})
    }
    return CheckForm.findOne(query).lean().exec()
  },

  /**
   * This method will not be refactored as all calls should be repointed to sqlGetActiveForm.
   */
  sqlGetActiveFormPlain: (id) => {
    throw new Error('do not implement')
  },

  /**
   * Fetch active forms (forms not soft-deleted)
   * @param query
   * @param sortField
   * @param sortDirection
   * @returns {Promise.<void>}
   */
  fetchSortedActiveForms: async (query, sortField, sortDirection) => {
    let sort = {}
    let q = query

    if (sortField && sortDirection) {
      sort[sortField] = sortDirection
    }
    q.isDeleted = false
    return CheckForm.find(q).sort(sort).lean().exec()
  },

  /**
   * Fetch active forms (not deleted)
   * parameter usage was the same in all calls, so they have been omitted
   * @returns {Promise<*>}
   */
  sqlFetchSortedActiveForms: () => {
    const sql = 'SELECT * FROM mtc_admin].[checkForm] WHERE isDeleted=0 ORDER BY [name] ASC'
    return sqlService.query(sql)
  },

  /**
   * Create.
   * @param data
   * @returns {Promise<*>}
   */
  create: async (data) => {
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
   * @returns {Promise|*}
   */
  findCheckFormByName: (formName) => {
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
  }
}

module.exports = checkFormDataService
