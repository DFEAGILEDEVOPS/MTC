'use strict'
const moment = require('moment')

const gdsFullFormat = 'D MMMM YYYY'
const gdsShortFormat = 'D MMM YYYY'
const gdsLongFormat = 'DD MMM YYYY'

const dateService = {
  formatFullGdsDate: (date) => {
    return moment(date).format(gdsFullFormat)
  },

  formatShortGdsDate: (date) => {
    return moment(date).format(gdsShortFormat)
  },

  formatLongGdsDate: (date) => {
    return moment(date).format(gdsLongFormat)
  }
}

module.exports = dateService
