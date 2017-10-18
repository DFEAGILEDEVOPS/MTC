'use strict'

const CheckWindow = require('../../models/check-window')

const checkWindowDataService = {

  /**
   * Fetch check window document by id.
   * @param id
   * @returns {Promise.<*>}
   */
  fetchCheckWindow: async (id) => {
    let checkWindow
    checkWindow = await CheckWindow.findOne({'_id': id})
    return checkWindow
  },
  /**
   * Delete check window by id.
   * @param id
   * @returns {Promise.<void>}
   */
  deleteCheckWindow: async (id) => {
    await CheckWindow.deleteOne({'_id': id})
  }
}

module.exports = checkWindowDataService
