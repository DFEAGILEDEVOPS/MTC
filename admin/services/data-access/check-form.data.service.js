'use strict'

const CheckForm = require('../../models/check-form')

const checkFormDataService = {
  /**
   * Get form by id, when isDeleted is false.
   * @param id
   */
  getActiveForm: (id) => {
    return CheckForm.findOne({_id: id, isDeleted: false})
  },
  /**
   * Get all forms, when isDeleted is false.
   * @param q
   */
  getActiveForms: (q) => {
    if (!q) {
      q = {}
    }
    q.isDeleted = false
    return CheckForm.find(q)
  }
}

module.exports = checkFormDataService
