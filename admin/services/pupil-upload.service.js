const csv = require('fast-csv')
const fs = require('fs-extra')
const R = require('ramda')

const pupilDataService = require('./data-access/pupil.data.service')
const validateCSVService = require('./pupil-validate-csv.service')
const generateErrorCSVService = require('./generate-error-csv.service')
const redisCacheService = require('../services/data-access/redis-cache.service')
const redisKeyService = require('../services/redis-key.service')

const service = {}

/**
 *
 * @param {Array} csvDataArray
 * @param {object} school
 * @param {number} userId
 * @return {Promise<*>}
 */
const onCSVReadComplete = async (csvDataArray, school, userId) => {
  const { pupils, csvData, headers, validationErrors, hasValidationError } = await validateCSVService.process(csvDataArray, school)
  if (hasValidationError) return ({ fileErrors: validationErrors, hasValidationError })
  // Generate csv with errors
  const csvHasErrors = csvData.some(p => p[6])
  if (csvHasErrors) {
    const response = await generateErrorCSVService.generate(school, headers, csvData)
    if (response.hasError) return response
    return ({
      csvErrorFile: response.remoteFilename,
      hasValidationError: true
    })
  } else {
    // Save pupils if validation is successful
    const result = await pupilDataService.sqlInsertMany(pupils, userId)
    if (!R.prop('insertId', result)) return (new Error('No pupils were saved'))
    const pupilIds = Array.isArray(result.insertId) ? result.insertId : [result.insertId]
    return { pupilIds }
  }
}

/**
 *
 * @param {object} school
 * @param {object} uploadFile
 * @param {number} userId
 * @return {Promise<any>}
 */
service.upload = async (school, uploadFile, userId) => {
  if (userId === undefined) throw new Error('userId is required')
  let stream
  const pr = new Promise((resolve, reject) => {
    const csvDataArray = []
    stream = fs.createReadStream(uploadFile.file)
    csv.parseStream(stream)
      .on('data', (data) => {
        csvDataArray.push(data)
      })
      .on('end', async () => {
        try {
          const response = await onCSVReadComplete(csvDataArray, school, userId)
          const pupilRegisterRedisKey = redisKeyService.getPupilRegisterViewDataKey(school.id)
          await redisCacheService.drop(pupilRegisterRedisKey)
          return resolve(response)
        } catch (error) {
          reject(error)
        }
      })
  })
  return pr
}

module.exports = service
