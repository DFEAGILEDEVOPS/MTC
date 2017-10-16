'use strict'
const moment = require('moment')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'

const dateService = {
  formatFullGdsDate: (date) => {
    return moment(date).format(gdsFullFormat)
  },

  formatShortGdsDate: (date) => {
    return moment(date).format(gdsShortFormat)
  }
}

module.exports = dateService
