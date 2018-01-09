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
   * Find check form by name.
   * @param formName
   * @returns {Promise|*}
   */
  findCheckFormByName: (formName) => {
    let query = { 'isDeleted': false, 'name': formName }
    return CheckForm.findOne(query).lean().exec()
  }
}

module.exports = checkFormDataService
