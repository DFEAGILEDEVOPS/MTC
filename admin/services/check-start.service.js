'use strict'

const uuidv4 = require('uuid/v4')
const moment = require('moment')
const Check = require('../models/check')
const checkFormService = require('../services/check-form.service')
const checkWindowService = require('../services/check-window.service')

const checkStartService = {
  /**
   *
   * @param pupilId
   * @return {string} checkCode - UUID v4
   */
  startCheck: async function (pupilId) {
    // Get the current checkWindow, throw an error if there is no window available
    const checkWindow = await checkWindowService.getCurrentCheckWindow()

    // Allocate a checkForm to a pupil, or will throw an error
    const checkForm = await checkFormService.allocateCheckForm()

    // Generate a new CheckCode for this unique check
    const checkCode = uuidv4()

    // Ensure that the checkCode is unique - let's give a big hand to CosmosDB everyone, for not supporting
    // unique indexes
    // TODO: move this to data-access service
    const found = await Check.findOne({checkCode}).lean().exec()
    if (found) {
      throw new Error(`Failed to generate a unique UUID for the check code.  Pupil [${pupilId}]`)
    }
    // Save the details to the `Check` collection
    const check = new Check({
      pupilId,
      checkCode,
      checkWindowId: checkWindow._id,
      checkFormId: checkForm._id,
      pupilLoginDate: moment.utc(),
      checkStartedAt: null
    })
    await check.save()

    return {
      checkCode,
      checkForm
    }
  }
}

module.exports = checkStartService
