'use strict'

const moment = require('moment')
const CheckWindow = require('../../models/check-window')
const CheckForm = require('../../models/check-form')

const checkFormDataService = {

  getActiveForms: (q) => {
    if (!q) {
      q = {}
    }
    q.isDeleted = false
    return this.find(q)
  },

  const forms = await CheckForm.getActiveForms().sort({createdAt: -1}).exec()
let formData = forms.map(e => { return e.toJSON() })
}

module.exports = mongoose.model('checkFormDataService', checkFormDataService)
