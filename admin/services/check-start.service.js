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

const checkStartService = {}

/**
 * Create a check entry for a pupil, generate a pin, and allocate a form
 * Called from the admin app when the teacher generates a pin
 * @param pupilIds
 * @return {Promise<void>}
 */
checkStartService.prepareCheck = async function (pupilIds, dfeNumber) {
  // validate pupilsIds.  What do we do if a single pupil id is not found (or the user doesn't have the same School?)  Ignore or throw?
  // connection -> begin transaction
  // generate Pins
  // find out all previous check forms by pupil for the current check window
  // allocate a check form to each pupil randomly (in memory)
  // save all the check forms
  // connection -> commit transaction
  // on error -> rollback transaction

  if (!dfeNumber) {
    throw new Error('dfeNumber is required')
  }

  // Validate the incoming pupil list to ensure that the pupils are real ids
  // and that they belong to the user's school
  const pupils = await pupilDataService.sqlFindByIdAndDfeNumber(pupilIds, dfeNumber)
  const providedSet = new Set(pupilIds)
  const databaseSet = new Set(pupils.map(p => p.id.toString())) // the incoming form params are stringified numbers
  const difference = new Set([...providedSet].filter(x => !databaseSet.has(x)))

  if (difference.size > 0) {
    winston.warn(`Incoming pupil Ids not found for school [${dfeNumber}]: `, difference)
    throw new Error('Validation failed')
  }

   // Find the check window we are working in
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()

  // Update the pins for each pupil
  await pinGenerationService.updatePupilPins(pupilIds)

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
