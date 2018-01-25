'use strict'

const R = require('ramda')
const schoolDataService = require('../services/data-access/school.data.service')
const headteacherDeclarationDataService = require('./data-access/headteacher-declaration.data.service')
const headteacherDeclarationService = {}

/**
 * Declare the results of the check, to be used by the Headteacher or equivalent role
 * This is the personal sign-off from the head, and closes the check for their school.
 * @param {object} form
 * @param {number} dfeNumber
 * @return {Promise<void>}
 */
headteacherDeclarationService.declare = async (form, dfeNumber, userId) => {
  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)

  if (!school) {
    throw new Error(`school ${dfeNumber} not found`)
  }

  const data = R.clone(form)

  data.signedDate = new Date()
  data.school_id = school.id
  data.user_id = userId

  // Add the check window they are signing for
  // TODO: data-refactor: update this once the checkwindow refactoring is done.
  data.checkWindow_id = 1

  await headteacherDeclarationDataService.sqlCreate(data)

  // TODO: hdf: close the check for the school?
}

/**
 * Return the last HDF submitted for a school, using DfeNumber
 * @param {number} dfeNumber
 * @return {Promise<void>}
 */
headteacherDeclarationService.findLatestHdfForSchool = async (dfeNumber) => {
  // TODO: hdf: role checks? Date checks?

  const school = await schoolDataService.sqlFindOneByDfeNumber(dfeNumber)
  if (!school) {
    return null
  }
  return headteacherDeclarationDataService.sqlFindLatestHdfBySchoolId(school.id)
}

/**
 * Returns true if we are in a check window and the hdf has already been submitted
 * False if we are not in a check window
 * False if we are in a check window and it has not been submitted
 * @param dfeNumber
 * @return {Promise<boolean>}
 */
headteacherDeclarationService.isHdfSubmittedForCurrentCheck = async (dfeNumber) => {
  const hdf = await headteacherDeclarationDataService.findCurrentHdfForSchool(dfeNumber)
  if (!hdf) {
    return false
  }
  if (!hdf.signedDate) {
    return false
  }
  return true
}

module.exports = headteacherDeclarationService
