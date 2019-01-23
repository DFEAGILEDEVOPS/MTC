'use strict'

const moment = require('moment')
const R = require('ramda')
const logger = require('./log.service').getLogger()

const checkDataService = require('../services/data-access/check.data.service')
const checkFormAllocationDataService = require('../services/data-access/check-form-allocation.data.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const config = require('../config')
const configService = require('../services/config.service')
const dateService = require('../services/date.service')
const featureToggles = require('feature-toggles')
// const jwtService = require('../services/jwt.service')
const pinGenerationService = require('../services/pin-generation.service')
const pinGenerationV2Service = require('../services/pin-generation-v2.service')
const pinGenerationDataService = require('../services/data-access/pin-generation.data.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const queueNameService = require('../services/queue-name-service')
const sasTokenService = require('../services/sas-token.service')
const setValidationService = require('../services/set-validation.service')
const azureQueueService = require('../services/azure-queue.service')

const checkStateService = require('../services/check-state.service')

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
checkStartService.prepareCheck = async function (
  pupilIds,
  dfeNumber,
  schoolId,
  pinEnv
) {
  // TODO: add transaction wrapper around the service calls to generate pins and checks

  if (!dfeNumber) {
    throw new Error('dfeNumber is required')
  }

  if (!schoolId) {
    throw new Error('schoolId is required')
  }

  // Validate the incoming pupil list to ensure that the pupils are real ids
  // and that they belong to the user's school
  const pupils = await pupilDataService.sqlFindByIdAndDfeNumber(
    pupilIds,
    dfeNumber
  )
  const difference = setValidationService.validate(
    pupilIds.map(x => parseInt(x, 10)),
    pupils
  )
  if (difference.size > 0) {
    logger.warn(
      `checkStartService.prepareCheck: incoming pupil Ids not found for school [${dfeNumber}]: `,
      difference
    )
    throw new Error('Validation failed')
  }

  // Find the check window we are working in
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()
  // TODO: Remove maxAttempts and reintroduce it within pin generation service once verified that travis can successfully use node env variables
  const maxAttempts = config.Data.pinSubmissionMaxAttempts
  const attemptsRemaining = config.Data.pinSubmissionMaxAttempts
  // Update the pins for each pupil
  await pinGenerationService.updatePupilPins(
    pupilIds,
    dfeNumber,
    maxAttempts,
    attemptsRemaining,
    schoolId,
    pinEnv
  )

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice
  const allForms = await checkFormService.getAllFormsForCheckWindow(
    checkWindow.id
  )
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the check for each pupil
  const checks = []
  for (let pid of pupilIds) {
    const usedFormIds = usedForms[pid] ? usedForms[pid].map(f => f.id) : []
    const c = await checkStartService.initialisePupilCheck(
      pid,
      checkWindow,
      allForms,
      usedFormIds,
      pinEnv === 'live'
    )
    checks.push(c)
  }
  await checkDataService.sqlCreateBatch(checks)
}

/**
 * Prepare a check for one or more pupils
 * This function will: * prepare a new check by writing an entry to the checkFormAllocation table
 *                     * place a message on the `prepare-check` queue for writing to `preparedCheck` table
 * @param pupilIds
 * @param dfeNumber
 * @param schoolId
 * @param isLiveCheck
 * @return {Promise<void>}
 */
checkStartService.prepareCheck2 = async function (
  pupilIds,
  dfeNumber,
  schoolId,
  isLiveCheck
) {
  if (!pupilIds) {
    throw new Error('pupilIds is required')
  }
  if (!schoolId) {
    throw new Error('schoolId is required')
  }

  // Validate the incoming pupil list to ensure that the pupils are real ids:
  // * that they belong to the user's school
  // * that they are eligible for pin generation
  // This also adds the `isRestart` flag onto the pupil object is the pupil is consuming a restart
  const pupils = await pinGenerationV2Service.getPupilsEligibleForPinGenerationById(
    schoolId,
    pupilIds,
    isLiveCheck
  )

  // Check to see if we lost any pupils during the data select, indicating - they weren't eligible for instance.
  const difference = setValidationService.validate(
    pupilIds.map(x => parseInt(x, 10)),
    pupils
  )
  if (difference.size > 0) {
    logger.error(
      `checkStartService.prepareCheck: incoming pupil Ids not found for school [${dfeNumber}]: `,
      difference
    )
    throw new Error('Validation failed')
  }

  // Find the check window we are working in
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice
  const allForms = await checkFormService.getAllFormsForCheckWindow(
    checkWindow.id
  )
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the checks for each pupil
  const checks = []
  for (let pupilId of pupilIds) {
    const usedFormIds = usedForms[pupilId]
      ? usedForms[pupilId].map(f => f.id)
      : []
    const c = await checkStartService.initialisePupilCheck(
      pupilId,
      checkWindow,
      allForms,
      usedFormIds,
      isLiveCheck,
      schoolId
    )
    checks.push(c)
  }
  // Create Checks in the Database
  const res = await pinGenerationDataService.sqlCreateBatch(checks)
  const newCheckIds = Array.isArray(res.insertId)
    ? res.insertId
    : [res.insertId]

  const newChecks = await pinGenerationDataService.sqlFindChecksForPupilsById(
    schoolId,
    newCheckIds,
    pupilIds
  )

  await pinGenerationV2Service.checkAndUpdateRestarts(
    schoolId,
    pupils,
    newCheckIds
  )

  if (isLiveCheck) {
    const pupilStatusQueueName = queueNameService.getName(
      queueNameService.NAMES.PUPIL_STATUS
    )

    // Request the pupil status be re-computed
    const pupilMessages = newChecks.map(c => { return { pupilId: c.pupil_id, checkCode: c.checkCode } })

    // Send a batch of messages for all the pupils requesting a status change
    await azureQueueService.addMessage(pupilStatusQueueName, { version: 2, messages: pupilMessages })
  }

  /*   // Create and save JWT Tokens for all pupils
  const pupilUpdates = []
  for (let pupil of pupils) {
    const token = await jwtService.createToken(
      { id: pupil },
      checkWindow.checkEndDate
    )
    pupilUpdates.push({
      id: pupil.id,
      jwtToken: token.token,
      jwtSecret: token.jwtSecret
    })
  }
  await pupilDataService.sqlUpdateTokensBatch(pupilUpdates) */

  // Prepare a bunch of messages ready to be inserted into the queue
  let prepareCheckQueueMessages
  try {
    prepareCheckQueueMessages = await checkStartService.prepareCheckQueueMessages(
      newCheckIds,
      schoolId
    )
  } catch (error) {
    logger.error('Unable to prepare check messages', error)
    throw error
  }

  // Get the queue name
  const prepareCheckQueueName = queueNameService.getName(
    queueNameService.NAMES.PREPARE_CHECK
  )

  // Send batch messages each containing the up to 20 prepare check messages.   This avoids hitting the max message size
  // for Azure Queues of 64Kb
  const batches = R.splitEvery(20, prepareCheckQueueMessages)
  for (let batch of batches) {
    await azureQueueService.addMessageAsync(prepareCheckQueueName, { version: 2, messages: batch })
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
checkStartService.initialisePupilCheck = async function (
  pupilId,
  checkWindow,
  availableForms,
  usedFormIds,
  isLiveCheck,
  schoolId = null
) {
  const checkForm = await checkFormService.allocateCheckForm(
    availableForms,
    usedFormIds
  )

  if (!checkForm) {
    throw new Error('CheckForm not allocated')
  }

  if (typeof isLiveCheck !== 'boolean') {
    throw new Error('isLiveCheck must be a boolean value')
  }

  logger.debug(
    `checkStartService.initialisePupilCheck(): allocated form ${checkForm.id}`
  )

  const checkData = {
    pupil_id: pupilId,
    checkForm_id: checkForm.id,
    checkWindow_id: checkWindow.id,
    isLiveCheck: isLiveCheck
  }

  if (featureToggles.isFeatureEnabled('prepareCheckMessaging')) {
    checkData.pinExpiresAt = pinGenerationService.getPinExpiryTime()
    checkData.school_id = schoolId
  }

  // checkCode will be created by the database on insert
  // checkStatus_id will default to '1' - 'New'

  return checkData
}

/**
 *
 * @param pupilId
 * @return {Promise<*>} partial check data
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
  await checkStateService.changeState(
    check.checkCode,
    checkStateService.States.Collected
  )
  const questions = JSON.parse(checkForm.formData)
  return { checkCode: check.checkCode, questions, practice: !check.isLiveCheck }
}

/**
 * Query the DB and put the info into messages suitable for placing on the prepare-check queue
 * The message needs to contain everything the pupil needs to login and take the check
 * @param checkIds
 * @param {number} schoolId - DB PK - school.id
 * @return {Promise<Array>}
 */
checkStartService.prepareCheckQueueMessages = async function (checkIds, schoolId) {
  if (!checkIds) {
    throw new Error('checkIds is not defined')
  }

  if (!Array.isArray(checkIds)) {
    throw new Error('checkIds must be an array')
  }

  const messages = []
  const checks = await checkFormAllocationDataService.sqlFindByIdsHydrated(
    checkIds
  )
  const sasExpiryDate = moment().add(config.Tokens.sasTimeOutHours, 'hours')

  const hasLiveChecks = R.all(c => R.equals(c.check_isLiveCheck, true))(checks)
  let checkCompleteSasToken

  const checkStartedSasToken = sasTokenService.generateSasToken(
    queueNameService.NAMES.CHECK_STARTED,
    sasExpiryDate
  )
  const pupilPreferencesSasToken = sasTokenService.generateSasToken(
    queueNameService.NAMES.PUPIL_PREFS,
    sasExpiryDate
  )
  if (hasLiveChecks) {
    checkCompleteSasToken = sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_COMPLETE,
      sasExpiryDate
    )
  }
  const pupilFeedbackSasToken = sasTokenService.generateSasToken(
    queueNameService.NAMES.PUPIL_FEEDBACK,
    sasExpiryDate
  )

  // Get check config for all pupils
  const pupilIds = checks.map(check => check.pupil_id)
  let pupilConfigs
  try {
    pupilConfigs = await configService.getBatchConfig(pupilIds, schoolId)
  } catch (error) {
    logger.error('Error generating pupil configs', error)
    throw error
  }

  for (let o of checks) {
    // Pass the isLiveCheck config in to the SPA
    config.practice = !o.check_isLiveCheck
    const message = {
      checkCode: o.check_checkCode,
      schoolPin: o.school_pin,
      pupilPin: o.pupil_pin,
      pupil: {
        id: o.pupil_id,
        firstName: o.pupil_foreName,
        lastName: o.pupil_lastName,
        dob: dateService.formatFullGdsDate(o.pupil_dateOfBirth),
        checkCode: o.check_checkCode,
        check_id: o.check_check_id,
        pinExpiresAt: o.pupil_pinExpiresAt
      },
      school: {
        id: o.school_id,
        name: o.school_name
      },
      tokens: {
        checkStarted: {
          token: checkStartedSasToken.token,
          url: checkStartedSasToken.url
        },
        pupilPreferences: {
          token: pupilPreferencesSasToken.token,
          url: pupilPreferencesSasToken.url
        },
        pupilFeedback: {
          token: pupilFeedbackSasToken.token,
          url: pupilFeedbackSasToken.url
        },
        jwt: {
          token: 'token-disabled' // o.pupil_jwtToken
        }
      },
      questions: checkFormService.prepareQuestionData(
        JSON.parse(o.checkForm_formData)
      ),
      config: pupilConfigs[ o.pupil_id ]
    }
    if (o.check_isLiveCheck) {
      message.tokens.checkComplete = {
        token: checkCompleteSasToken.token,
        url: checkCompleteSasToken.url
      }
    }
    messages.push(message)
  }
  return messages
}

module.exports = checkStartService
