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

    // Ensure that the checkCode is unique - let's give a big hand to CosmosDB everyone, for not supporting
    // secondary unique indexes.
    const found = await checkDataService.sqlFindOneByCheckCode(checkCode)
    if (found) {
      throw new Error(`Failed to generate a unique UUID for the check code. Pupil [${pupilId}]`)
    }

    const checkData = {
      pupilId,
      checkCode,
      checkWindowId: checkWindow._id,
      checkFormId: checkForm._id,
      pupilLoginDate: moment.utc(),
      checkStartedAt: null
    }

    // Save the details to the `Check` collection
    await checkDataService.create(checkData)

    return {
      checkCode,
      checkForm
    }
  }
}

module.exports = checkStartService
