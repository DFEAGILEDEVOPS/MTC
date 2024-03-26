'use strict'

const R = require('ramda')
const pupilValidator = require('../lib/validator/pupil-validator')
const dateService = require('./date.service')
const pupilDataService = require('./data-access/pupil.data.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')

const pupilAddService = {
  /**
   * Add pupil.
   * @param {object} pupilData
   * @param {number} schoolId
   * @param {number} userId
   * @returns {Promise<any>}
   */
  addPupil: async function addPupil (pupilData, schoolId, userId) {
    if (pupilData === undefined || Object.keys(pupilData).length < 10) throw new Error('pupilData is required')
    if (isNaN(schoolId)) throw new Error('schoolId is required')
    if (isNaN(userId)) throw new Error('userId is required')
    const cleanUPN = R.pathOr('', ['upn'], pupilData).trim().toUpperCase()

    const pupilDataRow = {
      school_id: schoolId,
      upn: cleanUPN,
      foreName: pupilData.foreName,
      lastName: pupilData.lastName,
      middleNames: pupilData.middleNames,
      foreNameAlias: pupilData.foreNameAlias,
      lastNameAlias: pupilData.lastNameAlias,
      gender: pupilData.gender,
      'dob-month': pupilData['dob-month'],
      'dob-day': pupilData['dob-day'],
      'dob-year': pupilData['dob-year'],
      lastModifiedBy_userId: userId
    }

    const validationError = await pupilValidator.validate(pupilDataRow, schoolId)
    if (validationError.hasError()) {
      throw validationError
    }

    const saveData = R.omit(['dob-day', 'dob-month', 'dob-year'], pupilDataRow)
    // @ts-ignore
    saveData.dateOfBirth = dateService.createUTCFromDayMonthYear(pupilDataRow['dob-day'], pupilDataRow['dob-month'], pupilDataRow['dob-year'])
    const res = await pupilDataService.sqlCreate(saveData)
    const pupilRecord = await pupilDataService.sqlFindOneById(res.insertId)
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
