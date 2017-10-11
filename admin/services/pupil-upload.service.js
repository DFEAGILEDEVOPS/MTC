const csv = require('fast-csv')
const fs = require('fs-extra')
const pupilDataService = require('./data-access/pupil.data.service')
const validateCSVService = require('./validate-csv.service')
const generateErrorCSVService = require('./generate-error-csv.service')

const onCSVReadComplete = async (csvDataArray, school, resolve) => {
  const { pupils, csvData, headers, validationErrors, hasValidationError } = await validateCSVService.process(csvDataArray, school)
  if (hasValidationError) resolve({ fileErrors: validationErrors, hasValidationError })
  // Generate csv with errors
  const csvHasErrors = csvData.some(p => p[6])
  if (csvHasErrors) {
    const csvBlob = await generateErrorCSVService.generate(school, headers, csvData)
    if (csvBlob.hasError) resolve(csvBlob.error)
    return resolve({
      csvErrorFile: csvBlob.file.name,
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
}

module.exports.upload = async (school, uploadFile) => {
  let stream
  const pr = await new Promise((resolve) => {
    let csvDataArray = []
    stream = fs.createReadStream(uploadFile.file)
    csv.fromStream(stream)
      .on('data', (data) => {
        csvDataArray.push(data)
      })
      .on('end', async () => {
        await onCSVReadComplete(csvDataArray, school, resolve)
      })
  })
  return pr
}
