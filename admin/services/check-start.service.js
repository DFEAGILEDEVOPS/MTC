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
 * @param {Array.<number>} pupilIds
 * @param {number} dfeNumber
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

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice
  const allForms = await checkFormService.getAllFormsForCheckWindow(checkWindow.id)
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the check for each pupil
  const checks = []
  for (let pid of pupilIds) {
    const usedFormIds = usedForms[pid] ? usedForms[pid].map(f => f.id) : []
    const c = await checkStartService.initialisePupilCheck(pid, checkWindow, allForms, usedFormIds)
    checks.push(c)
  }
  await checkDataService.sqlCreateBatch(checks)
}

/**
 * Return a new pupil check object. Saving the data is handled in a batch process by the caller
 * @private
 * @param {number} pupilId
 * @param {object} checkWindow
 * @param {Array.<Object>} availableForms
 * @param {Array.<number>} usedFormIds
 * @return {Promise<{pupil_id: *, checkWindow_id, checkForm_id}>}
 */
checkStartService.initialisePupilCheck = async function (pupilId, checkWindow, availableForms, usedFormIds) {
  const checkForm = await checkFormService.allocateCheckForm(availableForms, usedFormIds)

  if (!checkForm) {
    throw new Error('CheckForm not allocated')
  }

  winston.debug(`checkStartService.initialisePupilCheck(): allocated form ${checkForm.id}`)

  const checkData = {
    pupil_id: pupilId,
    checkWindow_id: checkWindow.id,
    checkForm_id: checkForm.id
  }

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

  let checkForm = null
  let checkForms = []

  // If they have not logged in before, then give selected form.
  if (check.pupilLoginDate === null) {
    const res = await checkFormDataService.sqlGetActiveForm(check.checkForm_id)

    checkForm = res ? R.head(res) : null
  } else {
    // Edge case, when they have logged in before but did not send completed test
    const allForms = await checkFormService.getAllFormsForCheckWindow(check.checkWindow_id)

    checkForms = JSON.parse(`[${check.seenCheckForm_ids || ''}]`)

    // If a pupil has seen all the checkForms, then we need to empty the array
    if (checkForms.length === allForms.length) checkForms = []

    checkForm = await checkFormService.allocateCheckForm(allForms, checkForms)
  }

  if (!checkForm) {
    throw new Error('CheckForm not found: ' + check.checkForm_id)
  }
  const checkData = {
    id: check.id,
    checkForm_id: checkForm.id,
    pupilLoginDate: moment.utc(),
    seenCheckForm_ids: R.append(checkForm.id, checkForms)
  }

  await checkDataService.sqlUpdate(checkData)
  const questions = JSON.parse(checkForm.formData)
  return { checkCode: check.checkCode, questions }
}

module.exports = checkStartService
