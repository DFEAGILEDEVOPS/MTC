'use strict'
const CheckWindow = require('../models/check-window')

const checkWindowService = {

  /**
   * Get check window for the current time.
   * @returns {Promise.<*>}
   */
  getCurrentCheckWindow: async () => {
    const now = new Date()
    const checkWindow = await CheckWindow.findOne({startDate: {$lte: now}, endDate: {$gte: now}}).exec()
    if (!checkWindow) {
      throw new Error('No checkwindow is currently available')
    }
    return checkWindow
  },
  /**
   * @param url
   * @returns {*}
   */
  addForwardSlashToUrl: (url) => {
    if (url) {
      let formattedUrl = url
      if (url[url.length - 1] !== '/') {
        formattedUrl = url + '/'
      }
      return formattedUrl
    }
  }
}

module.exports = checkWindowService
