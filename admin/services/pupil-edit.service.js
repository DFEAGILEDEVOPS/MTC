'use strict'

const R = require('ramda')

const dateService = require('../services/date.service')
const pupilAgeReasonService = require('../services/pupil-age-reason.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')

const pupilEditService = {}

/**
 * Perform pupil details update
 * @param {Object} pupil
 * @param {Object} requestBody
 * @param {Number} schoolId
 * @returns {Promise<any>}
 */
pupilEditService.update = async function (pupil, requestBody, schoolId, userId) {
  if (pupil === undefined) throw new Error('pupil is required')
  await PupilFrozenService.throwIfFrozenByIds([pupil.id])
  if (userId === undefined) throw new Error('userId is required')
  if (schoolId === undefined) throw new Error('schoolId is required')
  const trimAndUppercase = R.compose(R.toUpper, R.trim)
  if (pupil.ageReason !== requestBody.ageReason) {
    // Only update the reason if it has changed, not simply because the pupil was edited
    await pupilAgeReasonService.refreshPupilAgeReason(pupil.id, requestBody.ageReason, pupil.ageReason, userId)
  }
  const update = {
    id: pupil.id,
    foreName: requestBody.foreName,
    middleNames: requestBody.middleNames,
    foreNameAlias: requestBody.foreNameAlias,
    lastNameAlias: requestBody.lastNameAlias,
    lastName: requestBody.lastName,
    upn: trimAndUppercase(R.pathOr('', ['upn'], requestBody)),
    gender: requestBody.gender,
    dateOfBirth: dateService.createUTCFromDayMonthYear(requestBody['dob-day'], requestBody['dob-month'], requestBody['dob-year']),
    lastModifiedBy_userId: userId
  }
  await pupilDataService.sqlUpdate(update)
  const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
  await redisCacheService.drop(pupilRegisterRedisKey)
}

module.exports = pupilEditService
