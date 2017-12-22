'use strict'

const uuidv4 = require('uuid/v4')
const moment = require('moment')
const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const checkDataService = require('../services/data-access/check.data.service')

const checkStartService = {
  /**
   *
   * @param pupilId
   * @return {string} checkCode - UUID v4
   */
  startCheck: async function (pupilId) {
    // Get the current checkWindow, throw an error if there is no window available
    const checkWindow = await checkWindowDataService.fetchCurrentCheckWindow()

    // Allocate a checkForm to a pupil, or will throw an error
    const checkForm = await checkFormService.allocateCheckForm()

    // Generate a new CheckCode for this unique check
    const checkCode = uuidv4()
    // TODO: the hard coded values below are in place until check form and window move to SQL
    const checkData = {
      pupil_id: 1,
      checkCode,
      checkWindow_id: 1,
      checkForm_id: 1,
      pupilLoginDate: moment.utc(),
      startedAt: null
    }

    // Save the details to the `Check` table
    await checkDataService.sqlCreate(checkData)

    return {
      checkCode,
      checkForm
    }
  }
}

module.exports = checkStartService
