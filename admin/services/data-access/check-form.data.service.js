'use strict'

const CheckForm = require('../../models/check-form')

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
    query.isDeleted = false

    return CheckForm.find(q).sort(sort).lean().exec()
  },

  create: async (data) => {
    const checkForm = new CheckForm(data)
    await checkForm.save()
    return checkForm.toObject()
  }
}

module.exports = checkFormDataService
