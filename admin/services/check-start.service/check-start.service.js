'use strict'

const moment = require('moment-timezone')
const R = require('ramda')
const logger = require('../log.service').getLogger()

// Libraries used
const config = require('../../config')

// moved
const setValidationService = require('../set-validation.service')
const checkStartDataService = require('./data-access/check-start.data.service')

// to be moved to the module
const checkFormAllocationDataService = require('../data-access/check-form-allocation.data.service')
const checkFormService = require('../check-form.service')
const configService = require('../config.service')
const dateService = require('../date.service')
const pinGenerationDataService = require('../data-access/pin-generation.data.service')
const pinValidityGeneratorService = require('../pin-validity-generator.service')
const prepareCheckService = require('../prepare-check.service')
const queueNameService = require('../queue-name-service')
const sasTokenService = require('../sas-token.service')
const redisCacheService = require('../data-access/redis-cache.service')
const redisKeyService = require('../redis-key.service')
const oneMonthInSeconds = 2592000

const fourPmToday = () => moment().startOf('day').add(16, 'hours')
const endOfDay = () => moment().endOf('day')

const checkStartService = {
  validatePupilsAreStillEligible: async function (pupils, pupilIds, dfeNumber) {
    // Validate the incoming pupil list to ensure that the pupils are real ids:
    // * that they belong to the user's school
    // * that they are eligible for pin generation
    // This also adds the `isRestart` flag onto the pupil object is the pupil is consuming a restart
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
  }
}

/**
 * Prepare a check for one or more pupils
 * This function will: * prepare a new check by writing an entry to the checkFormAllocation table
 *                     * place a message on the `prepare-check` queue for writing to `preparedCheck` table
 *                     * Store the check config in the `checkConfig` table
 *                     * request pupil-status changes by writing to the `pupil-status` queue
 * @param { number[] } pupilIds - pupils selected from the UI/form
 * @param { number } dfeNumber - school dfeNumber that the teachers works at
 * @param { number } schoolId - school ID that the teacher works at
 * @param { boolean } isLiveCheck
 * @param { null | string } schoolTimezone - e.g 'Europe/London'
 * @param { {id: number} } checkWindow
 * @return { Promise<void> }
 */
checkStartService.prepareCheck2 = async function (
  pupilIds,
  dfeNumber,
  schoolId,
  isLiveCheck,
  schoolTimezone = null,
  checkWindow
) {
  if (!pupilIds) {
    throw new Error('pupilIds is required')
  }
  if (!schoolId) {
    throw new Error('schoolId is required')
  }

  const pupils = await checkStartDataService.sqlFindPupilsEligibleForPinGenerationById(
    schoolId,
    pupilIds,
    isLiveCheck
  )

  // This validation will throw on a failed validation, so don't trap it.
  await this.validatePupilsAreStillEligible(pupils, pupilIds, dfeNumber)

  // Find the set of all forms allocated to a check window
  // Just returns objects with an ID property
  const formsCacheKey = redisKeyService.getCheckFormsKey(checkWindow.id, isLiveCheck)
  let allForms = await redisCacheService.get(formsCacheKey)
  if (!allForms) {
    allForms = await checkStartDataService.sqlFindAllFormsAssignedToCheckWindow(
      checkWindow.id,
      isLiveCheck
    )
    await redisCacheService.set(formsCacheKey, allForms, oneMonthInSeconds)
  }

  // Find all used forms for each pupil, so we make sure they do not
  // get allocated the same form twice.  Just returns minimal form objects (id an name)
  // to keep the data overhead down.
  const usedForms = await checkStartDataService.sqlFindAllFormsUsedByPupils(pupilIds)

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

  let pupilChecks
  try {
    pupilChecks = await checkStartService
      .createPupilCheckPayloads(newCheckIds, schoolId)
  } catch (error) {
    logger.error('Unable to prepare check messages', error)
    throw error
  }

  // Put the checks into redis for pupil-login at scale
  await prepareCheckService.prepareChecks(pupilChecks)

  // Store the `config` section from the preparedCheckMessages into the DB
  return this.storeCheckConfigs(pupilChecks, newChecks)
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
 * @param {number} pupilId
 * @param {object} checkWindow
 * @param { {id: number}[] } availableForms
 * @param {Array.<number>} usedFormIds
 * @param {boolean} isLiveCheck
 * @param {number} schoolId
 * @param {null | String} schoolTimezone
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
  checkData.pinExpiresAt = pinValidityGeneratorService.generatePinTimestamp(config.OverridePinExpiry, endOfDay(), fourPmToday(), schoolTimezone)
  checkData.school_id = schoolId

  // checkCode will be created by the database on insert
  // checkStatus_id will default to '1' - 'New'
  return checkData
}

/**
 * Return pupil login payloads
 * The payload needs to contain everything the pupil needs to login and take the check
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

  const payloads = []
  const checks = await checkFormAllocationDataService.sqlFindByIdsHydrated(
    checkIds
  )
  const sasExpiryDate = moment().add(config.Tokens.sasTimeOutHours, 'hours')

  const hasLiveChecks = R.all(c => R.equals(c.check_isLiveCheck, true))(checks)
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

    const payload = {
      checkCode: o.check_checkCode,
      schoolPin: o.school_pin,
      pupilPin: o.pupil_pin,
      pupil: {
        firstName: o.pupil_foreNameAlias || o.pupil_foreName,
        lastName: o.pupil_lastNameAlias || o.pupil_lastName,
        dob: dateService.formatFullGdsDate(o.pupil_dateOfBirth),
        checkCode: o.check_checkCode,
        check_id: o.check_check_id,
        pinExpiresAt: o.pupil_pinExpiresAt,
        uuid: o.pupil_uuid
      },
      school: {
        name: o.school_name,
        uuid: o.school_uuid
      },
      tokens: {
        checkStarted: checkStartedSasToken,
        pupilPreferences: pupilPreferencesSasToken,
        pupilFeedback: pupilFeedbackSasToken,
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
      payload.tokens.checkComplete = checkSubmitSasToken
    }
    payloads.push(payload)
  }
  return payloads
}

module.exports = checkStartService
