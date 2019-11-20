'use strict'

const moment = require('moment-timezone')
const R = require('ramda')
const logger = require('./log.service').getLogger()

const azureQueueService = require('../services/azure-queue.service')
const checkDataService = require('../services/data-access/check.data.service')
const checkFormAllocationDataService = require('../services/data-access/check-form-allocation.data.service')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkFormService = require('../services/check-form.service')
const checkStartDataService = require('../services/data-access/check-start.data.service')
const checkStateService = require('../services/check-state.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const config = require('../config')
const configService = require('../services/config.service')
const dateService = require('../services/date.service')
const pinGenerationDataService = require('../services/data-access/pin-generation.data.service')
const pinGenerationService = require('../services/pin-generation.service')
const pinGenerationV2Service = require('../services/pin-generation-v2.service')
const queueNameService = require('../services/queue-name-service')
const sasTokenService = require('../services/sas-token.service')
const setValidationService = require('../services/set-validation.service')
const prepareCheckService = require('./prepare-check.service')
const featureToggles = require('feature-toggles')

const checkStartService = {}

/**
 * Prepare a check for one or more pupils
 * This function will: * prepare a new check by writing an entry to the checkFormAllocation table
 *                     * place a message on the `prepare-check` queue for writing to `preparedCheck` table
 *                     * Store the check config in the `checkConfig` table
 *                     * request pupil-status changes by writing to the `pupil-status` queue
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
  isLiveCheck,
  schoolTimezone = null
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
  const allForms = await checkFormService.getAllFormsForCheckWindowByType(
    checkWindow.id,
    isLiveCheck
  )
  const usedForms = await checkDataService.sqlFindAllFormsUsedByPupils(pupilIds)

  // Create the checks for each pupil
  const checks = []
  for (const pupilId of pupilIds) {
    const usedFormIds = usedForms[pupilId]
      ? usedForms[pupilId].map(f => f.id)
      : []
    const c = await checkStartService.initialisePupilCheck(
      pupilId,
      checkWindow,
      allForms,
      usedFormIds,
      isLiveCheck,
      schoolId,
      schoolTimezone
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
    await azureQueueService.addMessageAsync(pupilStatusQueueName, { version: 2, messages: pupilMessages })
  }

  let pupilChecks
  try {
    pupilChecks = await checkStartService
      .createPupilCheckPayloads(newCheckIds, schoolId)
  } catch (error) {
    logger.error('Unable to prepare check messages', error)
    throw error
  }
  const prepareCheckServiceEnabled = featureToggles.isFeatureEnabled('prepareChecksInRedis')

  if (prepareCheckServiceEnabled) {
    prepareCheckService.prepareChecks(pupilChecks)
  } else {
    sendChecksToTableStorage(pupilChecks)
  }

  // Store the `config` section from the preparedCheckMessages into the DB
  return this.storeCheckConfigs(pupilChecks, newChecks)
}

async function sendChecksToTableStorage (pupilChecks, schoolId) {
  // Send batch messages each containing the up to 20 prepare check messages.   This avoids hitting the max message size
  // for Azure Queues of 64Kb
  // Get the queue name
  const prepareCheckQueueName = queueNameService.getName(
    queueNameService.NAMES.PREPARE_CHECK
  )
  logger.info(`check start service: prepare check batch size is ${config.prepareCheckMessageBatchSize}`)
  const batches = R.splitEvery(config.prepareCheckMessageBatchSize, pupilChecks)
  let batchCount = 1
  const totalBatches = batches.length
  for (const batch of batches) {
    logger.info(`check start service: sending batch ${batchCount} of ${totalBatches} for school ${schoolId}`)
    await azureQueueService.addMessageAsync(prepareCheckQueueName, { version: 2, messages: batch })
    batchCount += 1
  }
}

checkStartService.storeCheckConfigs = async function (preparedChecks, newChecks) {
  if (!Array.isArray(preparedChecks)) {
    throw new Error('`preparedChecks is not an array')
  }
  if (!preparedChecks.length) {
    return
  }
  const config = preparedChecks.map(pcheck => {
    return {
      checkCode: pcheck.checkCode,
      config: pcheck.config,
      checkId: newChecks.find(check => check.checkCode === pcheck.checkCode).id
    }
  })
  checkStartDataService.sqlStoreBatchConfigs(config)
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
  schoolId = null,
  schoolTimezone = null
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

  checkData.pinExpiresAt = pinGenerationService.getPinExpiryTime(schoolTimezone)
  checkData.school_id = schoolId

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
checkStartService.createPupilCheckPayloads = async function (checkIds, schoolId) {
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
  let checkSubmitSasToken

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
    checkSubmitSasToken = sasTokenService.generateSasToken(
      queueNameService.NAMES.CHECK_SUBMIT,
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

  for (const o of checks) {
    // Pass the isLiveCheck config in to the SPA
    const pupilConfig = pupilConfigs[o.pupil_id]
    pupilConfig.practice = !o.check_isLiveCheck
    pupilConfig.compressCompletedCheck = !!config.PupilAppUseCompression

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
        name: o.school_name,
        uuid: o.school_uuid
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
      config: pupilConfig
    }
    if (o.check_isLiveCheck) {
      message.tokens.checkComplete = {
        token: checkCompleteSasToken.token,
        url: checkCompleteSasToken.url
      }
      message.tokens.checkSubmit = {
        token: checkSubmitSasToken.token,
        url: checkCompleteSasToken.url
      }
    }
    messages.push(message)
  }
  return messages
}

module.exports = checkStartService
