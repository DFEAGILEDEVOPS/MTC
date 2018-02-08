'use strict'

const moment = require('moment')
const R = require('ramda')
const winston = require('winston')

const checkDataService = require('../services/data-access/check.data.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const pinGenerationService = require('../services/pin-generation.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const setValidationService = require('../services/set-validation.service')
const config = require('../config')

const checkStartService = {}

/**
 * Create a check entry for a pupil, generate a pin, and allocate a form
 * Called from the admin app when the teacher generates a pin
 * @param {Array} pupilIds
 * @param dfeNumber
 * @return {Promise<void>}
 */
checkStartService.prepareCheck = async function (pupilIds, dfeNumber) {
  // TODO: add transaction wrapper around the service calls to generate pins and checks

  if (!dfeNumber) {
    throw new Error('dfeNumber is required')
  }

  // Validate the incoming pupil list to ensure that the pupils are real ids
  // and that they belong to the user's school
  const pupils = await pupilDataService.sqlFindByIdAndDfeNumber(pupilIds, dfeNumber)
  const difference = setValidationService.validate(pupilIds.map(x => parseInt(x, 10)), pupils)
  if (difference.size > 0) {
    winston.warn(`checkStartService.prepareCheck: incoming pupil Ids not found for school [${dfeNumber}]: `, difference)
    throw new Error('Validation failed')
  }

   // Find the check window we are working in
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()
  // TODO: Remove maxAttempts and reintroduce it within pin generation service once verified that travis can successfully use node env variables
  const maxAttempts = config.Data.pinSubmissionMaxAttempts
  const attemptsRemaining = config.Data.pinSubmissionMaxAttempts
  // Update the pins for each pupil
  await pinGenerationService.updatePupilPins(pupilIds, dfeNumber, maxAttempts, attemptsRemaining)

  // Create the check for each pupil
  const checks = []
  for (let id of pupilIds) {
    const c = await checkStartService.initialisePupilCheck(id, checkWindow)
    checks.push(c)
  }
  await checkDataService.sqlCreateBatch(checks)
}

// Return a new pupil check object
checkStartService.initialisePupilCheck = async function (pupilId, checkWindow) {
  const checkForm = await checkFormService.allocateCheckForm()

  if (!checkForm) {
    throw new Error('CheckForm not allocated')
  }

  const checkData = {
    pupil_id: pupilId,
    checkWindow_id: checkWindow.id,
    checkForm_id: checkForm.id
  }

  // Save the details to the `Check` table
  return checkData
}

/**
 *
 * @param pupilId
 * @return {Promise<*>} checkCode - UUID v4
 */
checkStartService.pupilLogin = async function (pupilId) {
  const check = await checkDataService.sqlFindOneForPupilLogin(pupilId)
  if (!check) {
    throw new Error('Unable to find a prepared check for pupil: ' + pupilId)
  }

  const res = await checkFormDataService.sqlGetActiveForm(check.checkForm_id)
  if (!res) {
    throw new Error('CheckForm not found: ' + check.checkForm_id)
  }
  const checkForm = R.head(res)
  const checkData = {
    id: check.id,
    pupilLoginDate: moment.utc()
  }

  await checkDataService.sqlUpdate(checkData)
  const questions = JSON.parse(checkForm.formData)
  return { checkCode: check.checkCode, questions }
}

module.exports = checkStartService
