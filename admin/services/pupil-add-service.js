'use strict'

const R = require('ramda')
const pupilValidator = require('../lib/validator/pupil-validator')
const dateService = require('./date.service')
const pupilDataService = require('./data-access/pupil.data.service')
const pupilAgeReasonDataService = require('./data-access/pupil-age-reason.data.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')

const pupilAddService = {
  /**
   * Add pupil.
   * @param reqBody
   * @param schoolId
   * @returns {Promise<any>}
   */
  addPupil: async function addPupil (reqBody, schoolId) {
    if (!reqBody || Object.keys(reqBody).length < 11 || !schoolId || schoolId.length < 1) {
      throw new Error('Invalid req.body and/or school id. Saving pupil failed.')
    }

    const pupilData = {
      school_id: schoolId,
      upn: reqBody.upn,
      foreName: reqBody.foreName,
      lastName: reqBody.lastName,
      middleNames: reqBody.middleNames,
      foreNameAlias: reqBody.foreNameAlias,
      lastNameAlias: reqBody.lastNameAlias,
      gender: reqBody.gender,
      'dob-month': reqBody['dob-month'],
      'dob-day': reqBody['dob-day'],
      'dob-year': reqBody['dob-year'],
      ageReason: reqBody.ageReason
    }

    const validationError = await pupilValidator.validate(pupilData, schoolId)
    if (validationError.hasError()) {
      throw validationError
    }

    const saveData = R.omit(['dob-day', 'dob-month', 'dob-year', 'ageReason'], pupilData)
    // @ts-ignore
    saveData.dateOfBirth = dateService.createUTCFromDayMonthYear(pupilData['dob-day'], pupilData['dob-month'], pupilData['dob-year'])
    saveData.upn = R.pathOr('', ['upn'], pupilData).trim().toUpperCase()

    const res = await pupilDataService.sqlCreate(saveData)
    const pupilRecord = await pupilDataService.sqlFindOneById(res.insertId)

    if (pupilData.ageReason) {
      await pupilAgeReasonDataService.sqlInsertPupilAgeReason(res.insertId, pupilData.ageReason)
    }
    const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(schoolId)
    await redisCacheService.drop(pupilRegisterRedisKey)
    return pupilRecord
  },

  /**
   * Format pupil's date of birth.
   * @param pupil
   * @returns {Array}
   */
  formatPupilData: function formatPupilData (pupil) {
    let pupilData = []
    if (!pupil || pupil.length < 1) {
      return pupilData
    }
    // @ts-ignore
    pupilData = R.omit(['dateOfBirth'], pupil)
    // expand single date field to 3
    pupilData['dob-day'] = pupil.dateOfBirth.format('D')
    pupilData['dob-month'] = pupil.dateOfBirth.format('M')
    pupilData['dob-year'] = pupil.dateOfBirth.format('YYYY')
    return pupilData
  }
}

module.exports = pupilAddService
