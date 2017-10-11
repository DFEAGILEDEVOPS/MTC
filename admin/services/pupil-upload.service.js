const csv = require('fast-csv')
const moment = require('moment')
const fs = require('fs-extra')
const uuidv4 = require('uuid/v4')
const { promisify } = require('bluebird')
const { azureUploadFile } = require('./data-access/azure-file.data.service')
const csvValidator = require('../lib/validator/csv-validator')
const singlePupilValidation = require('./single-pupil-validation.service')
const pupilDataService = require('./data-access/pupil.data.service')

module.exports.upload = async (school, uploadFile) => {
  let stream
  const pr = await new Promise((resolve) => {
    let csvData = []
    stream = fs.createReadStream(uploadFile.file)
    csv.fromStream(stream)
      .on('data', (data) => {
        csvData.push(data)
      })
      .on('end', async () => {
        // Remove error column and headers from data and validate rows
        if (csvData.some(p => p[ 6 ])) csvData.map((r) => r.splice(6, 1))
        let headers = csvData.shift(0)
        const validationErrors = csvValidator.validate(csvData)
        // Resolve if csv validation errors have occurred
        if (validationErrors.hasError()) return resolve({ fileErrors: validationErrors, hasValidationError: true })
        // validate each pupil
        const pupils = []
        csvData = await Promise.all(csvData.map(async (p) => {
          const { pupil, single } = await singlePupilValidation.validate(p, school)
          pupils.push(pupil)
          return single
        }))
        // Generate csv with errors
        if (csvData.some(p => p[6])) {
          const errorsCsv = []
          headers.push('Errors')
          errorsCsv.push(headers)
          csvData.forEach((p) => errorsCsv.push(p))
          const writeToString = promisify(csv.writeToString)
          const csvStr = await writeToString(errorsCsv, { headers: true })
          // Upload csv to Azure
          let csvBlobFile
          try {
            const remoteFilename = `${school._id}_${uuidv4()}_${moment().format('YYYYMMDDHHmmss')}_error.csv`
            const streamLength = 512 * 1000
            csvBlobFile = await azureUploadFile('csvuploads', remoteFilename, csvStr, streamLength)
          } catch (error) {
            return resolve({ error })
          }
          return resolve({
            csvErrorFile: csvBlobFile.name,
            hasValidationError: true
          })
        } else {
          // Save pupils if validation is successful
          let pupilIds = []
          let savedPupils
          try {
            savedPupils = await pupilDataService.insertMany(pupils)
          } catch (error) {
            return resolve({ error })
          }
          savedPupils.map((p) => pupilIds.push(p._id))
          pupilIds = JSON.stringify(pupilIds)
          resolve({ pupils: savedPupils, pupilIds })
        }
      })
  })
  return pr
}
