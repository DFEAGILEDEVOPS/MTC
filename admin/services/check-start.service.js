'use strict'

const moment = require('moment')
const R = require('ramda')
const winston = require('winston')

const checkDataService = require('../services/data-access/check.data.service')
const checkFormAllocationDataService = require('../services/data-access/check-form-allocation.data.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const config = require('../config')
const configService = require('../services/config.service')
const dateService = require('../services/date.service')
const jwtService = require('../services/jwt.service')
const pinGenerationService = require('../services/pin-generation.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const sasTokenService = require('../services/sas-token.service')
const setValidationService = require('../services/set-validation.service')
const azureQueueService = require('../services/azure-queue.service')
const monitor = require('../helpers/monitor')

const checkStartService = {}

/**
 * Create a check entry for a pupil, generate a pin, and allocate a form
 * Called from the admin app when the teacher generates a pin
 * Generates the pin and check for a specific pin environment (live/fam)
 * @param {Array.<number>} pupilIds
 * @param {number} dfeNumber
 * @param {string} pinEnv
 * @return {Promise<void>}
 */
checkStartService.prepareCheck = async function (pupilIds, dfeNumber, schoolId, pinEnv) {
  // TODO: add transaction wrapper around the service calls to generate pins and checks

  if (!dfeNumber) {
    throw new Error('dfeNumber is required')
  }

  if (!schoolId) {
    throw new Error('schoolId is required')
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
  await pinGenerationService.updatePupilPins(pupilIds, dfeNumber, maxAttempts, attemptsRemaining, schoolId, pinEnv)

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice
  const allForms = await checkFormService.getAllFormsForCheckWindow(checkWindow.id)
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the check for each pupil
  const checks = []
  for (let pid of pupilIds) {
    const usedFormIds = usedForms[pid] ? usedForms[pid].map(f => f.id) : []
    const c = await checkStartService.initialisePupilCheck(pid, checkWindow, allForms, usedFormIds, pinEnv === 'live')
    delete c.isLiveCheck // this not used in the check table (deprecated); but by the checkFormAllocation table
    checks.push(c)
  }
  await checkDataService.sqlCreateBatch(checks)
}

// PrepareCheck 2: Write an entry to the checkFormAllocationTable, and place a message on the queue
// for writing to the data store used by pupil authentication.
checkStartService.prepareCheck2 = async function (pupilIds, dfeNumber, schoolId, isLiveCheck) {
  if (!pupilIds) {
    throw new Error('pupilIds is required')
  }
  if (!schoolId) {
    throw new Error('schoolId is required')
  }

  // Validate the incoming pupil list to ensure that the pupils are real ids
  // and that they belong to the user's school
  const pupils = await pupilDataService.sqlFindByIds(pupilIds, schoolId)
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
  // TODO: choose pinEnv here for the pupil pin
  await pinGenerationService.updatePupilPins(pupilIds, dfeNumber, maxAttempts, attemptsRemaining, schoolId)

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice
  const allForms = await checkFormService.getAllFormsForCheckWindow(checkWindow.id)
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the checkFormAllocations for each pupil
  const checkFormAllocations = []
  for (let pupilId of pupilIds) {
    const usedFormIds = usedForms[pupilId] ? usedForms[pupilId].map(f => f.id) : []
    const c = await checkStartService.initialisePupilCheck(pupilId, checkWindow, allForms, usedFormIds, isLiveCheck)
    checkFormAllocations.push(c)
  }
  const res = await checkFormAllocationDataService.sqlCreateBatch(checkFormAllocations)

  // Create and save JWT Tokens for all pupils
  const pupilUpdates = []
  for (let pupil of pupils) {
    const token = await jwtService.createToken({id: pupil}, checkWindow.checkEndDate)
    pupilUpdates.push({ id: pupil.id, jwtToken: token.token, jwtSecret: token.jwtSecret })
  }
  await pupilDataService.sqlUpdateTokensBatch(pupilUpdates)

  // Create messages on the queue for all these checks
  const prepareCheckQueueMessages = await this.prepareCheckQueueMessages(Array.isArray(res.insertId) ? res.insertId : [res.insertId])

  // Inject messages into the queue
  for (let msg of prepareCheckQueueMessages) {
    azureQueueService.addMessage(sasTokenService.queueNames.PREPARE_CHECK, msg)
  }
}

/**
 * Return a new pupil check object. Saving the data is handled in a batch process by the caller
 * @private
 * @param {number} pupilId
 * @param {object} checkWindow
 * @param {Array.<Object>} availableForms
 * @param {Array.<number>} usedFormIds
 * @param {boolean} isLiveCheck
 * @return {Promise<{pupil_id: *, checkWindow_id, checkForm_id}>}
 */
checkStartService.initialisePupilCheck = async function (pupilId, checkWindow, availableForms, usedFormIds, isLiveCheck) {
  const checkForm = await checkFormService.allocateCheckForm(availableForms, usedFormIds)

  if (!checkForm) {
    throw new Error('CheckForm not allocated')
  }

  winston.debug(`checkStartService.initialisePupilCheck(): allocated form ${checkForm.id}`)

  const checkData = {
    pupil_id: pupilId,
    checkForm_id: checkForm.id,
    checkWindow_id: checkWindow.id
  }

  if (typeof isLiveCheck !== 'boolean') {
    throw new Error('isLiveCheck must be a boolean value')
  }

  // checkCode will be created by the database on insert
  // checkStatus_id will default to '1' - 'New'
  checkData.isLiveCheck = isLiveCheck

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

/**
 * Query the DB and put the info into messages suitable for placing on the prepare-check queue
 * The message needs to contain everything the pupil needs to login and take the check
 * @param checkFormAllocationIds
 * @return {Promise<Array>}
 */
checkStartService.prepareCheckQueueMessages = async function (checkFormAllocationIds) {
  if (!checkFormAllocationIds) {
    throw new Error('checkFormAllocationIds is not defined')
  }

  if (!Array.isArray(checkFormAllocationIds)) {
    throw new Error('checkFormAllocationIds must be an array')
  }

  const messages = []
  const checkFormAllocations = await checkFormAllocationDataService.sqlFindByIdsHydrated(checkFormAllocationIds)
  const sasExpiryDate = moment().add(config.Tokens.sasTimeOutHours, 'hours')
  const sasToken = sasTokenService.generateSasToken(sasTokenService.queueNames.CHECK_COMPLETE, sasExpiryDate)

  for (let o of checkFormAllocations) {
    const config = await configService.getConfig({id: o.pupil_id}) // ToDo: performance note: this does 2 sql lookups per pupil. Optimise!
    const message = {
      schoolPin: o.school_pin,
      pupilPin: o.pupil_pin,
      pupil: {
        firstName: o.pupil_foreName,
        lastName: o.pupil_lastName,
        dob: dateService.formatFullGdsDate(o.pupil_dateOfBirth),
        checkCode: o.checkFormAllocation_checkCode
      },
      school: {
        id: o.school_id,
        name: o.school_name
      },
      tokens: {
        sasToken: {
          token: sasToken.token,
          url: sasToken.url
        },
        jwtToken: o.pupil_jwtToken
      },
      questions: checkFormService.prepareQuestionData(JSON.parse(o.checkForm_formData)),
      config: config
    }
    messages.push(message)
  }
  return messages
}

module.exports = monitor('check-start.service', checkStartService)
