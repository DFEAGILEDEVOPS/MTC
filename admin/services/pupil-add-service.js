'use strict'

const R = require('ramda')
const pupilValidator = require('../lib/validator/pupil-validator')
const dateService = require('./date.service')
const pupilDataService = require('./data-access/pupil.data.service')
const schoolDataService = require('./data-access/school.data.service')
const monitor = require('../helpers/monitor')

const pupilAddService = {
  /**
   * Add pupil.
   * @param reqBody
   * @param schoolId
   * @returns {Promise<void>}
   */
  addPupil: async (reqBody, schoolId) => {
    if (!reqBody || reqBody.length < 1 || !schoolId || schoolId.length < 1) {
      throw new Error('Invalid req.body and/or school id. Saving pupil failed.')
    }

    const pupilData = {
      school_id: schoolId,
      upn: reqBody.upn,
      foreName: reqBody.foreName,
      lastName: reqBody.lastName,
      middleNames: reqBody.middleNames,
      gender: reqBody.gender,
      'dob-month': reqBody['dob-month'],
      'dob-day': reqBody['dob-day'],
      'dob-year': reqBody['dob-year']
    }

    const validationError = await pupilValidator.validate(pupilData)
    if (validationError.hasError()) {
      throw validationError
    }

    const saveData = R.omit(['dob-day', 'dob-month', 'dob-year'], pupilData)
    saveData.dateOfBirth = dateService.createUTCFromDayMonthYear(pupilData['dob-day'], pupilData['dob-month'], pupilData['dob-year'])
    saveData.upn = R.pathOr('', ['upn'], pupilData).trim().toUpperCase()

    const res = await pupilDataService.sqlCreate(saveData)
    return pupilDataService.sqlFindOneById(res.insertId)
  },

  /**
   * Find school by DFE number.
   * @param dfeNumber
   * @returns {Promise<Array>}
   */
  findSchoolByDfeNumber: async (dfeNumber) => {
    let school = []
    if (!dfeNumber || dfeNumber.length < 1) {
      return school
    }
    try {
      school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
    } catch (error) {
      throw new Error(`School [${dfeNumber}] not found`)
    }
    return school
  },

  /**
   * Format pupil's date of birth.
   * @param pupil
   * @returns {Array}
   */
  formatPupilData: (pupil) => {
    let pupilData = []
    if (!pupil || pupil.length < 1) {
      return pupilData
    }
    pupilData = R.omit('dateOfBirth', pupil)
    // expand single date field to 3
    pupilData['dob-day'] = pupil.dateOfBirth.format('D')
    pupilData['dob-month'] = pupil.dateOfBirth.format('M')
    pupilData['dob-year'] = pupil.dateOfBirth.format('YYYY')
    return pupilData
  }
}

module.exports = monitor('pupil-add.service', pupilAddService)
