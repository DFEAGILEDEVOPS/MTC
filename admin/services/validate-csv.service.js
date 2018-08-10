const csvValidator = require('../lib/validator/csv-validator')
const singlePupilValidationService = require('./single-pupil-validation.service')
const arrayUtils = require('../lib/array-utils')
const monitor = require('../helpers/monitor')

const service = {}

/**
 *
 * @param csvDataArray
 * @param {object} school
 * @return {Promise<*>}
 */
service.process = async (csvDataArray, school) => {
  // Remove error column and headers from data and validate rows
  if (csvDataArray.some(p => p[ 6 ])) csvDataArray.map((r) => r.splice(6, 1))
  let headers = csvDataArray.shift(0)
  const validationErrors = csvValidator.validate(csvDataArray, headers, 'file-upload')
  // Resolve if csv validation errors have occurred
  if (validationErrors.hasError()) return { validationErrors, hasValidationError: true }
  // validate each pupil
  const pupils = []

  const cleanCsvData = arrayUtils.omitEmptyArrays(csvDataArray)

  singlePupilValidationService.init()
  const csvData = await Promise.all(cleanCsvData.map(async (p) => {
    const { pupil, single } = await singlePupilValidationService.validate(p, school)
    pupils.push(pupil)
    return single
  }))
  singlePupilValidationService.init() // tidy up as we're done
  return { pupils, csvData, headers }
}

module.exports = monitor('validate-csv.service', service)
