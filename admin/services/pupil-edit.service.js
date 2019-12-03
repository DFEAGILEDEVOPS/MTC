'use strict'

const R = require('ramda')

const dateService = require('../services/date.service')
const pupilAgeReasonService = require('../services/pupil-age-reason.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')

const pupilEditService = {}

/**
 * Perform pupil details update
 * @param {Object} pupil
 * @param {Object} requestBody
 * @param {Number} schoolId
 * @returns {Promise<any>}
 */
pupilEditService.update = async function (pupil, requestBody, schoolId) {
  const trimAndUppercase = R.compose(R.toUpper, R.trim)
  await pupilAgeReasonService.refreshPupilAgeReason(pupil.id, requestBody.ageReason, pupil.ageReason)
  // TODO: old core! Needs refactor this to a service and data service
  const update = {
    id: pupil.id,
    foreName: requestBody.foreName,
    middleNames: requestBody.middleNames,
    foreNameAlias: requestBody.foreNameAlias,
    lastNameAlias: requestBody.lastNameAlias,
    lastName: requestBody.lastName,
    upn: trimAndUppercase(R.pathOr('', ['upn'], requestBody)),
    gender: requestBody.gender,
    dateOfBirth: dateService.createUTCFromDayMonthYear(requestBody['dob-day'], requestBody['dob-month'], requestBody['dob-year'])
  }
  await pupilDataService.sqlUpdate(update)
  const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
  await redisCacheService.drop(pupilRegisterRedisKey)
}

module.exports = pupilEditService
