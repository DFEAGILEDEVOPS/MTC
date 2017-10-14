const csv = require('fast-csv')
const fs = require('fs-extra')
const pupilDataService = require('./data-access/pupil.data.service')
const validateCSVService = require('./validate-csv.service')
const generateErrorCSVService = require('./generate-error-csv.service')

const onCSVReadComplete = async (csvDataArray, school) => {
  const { pupils, csvData, headers, validationErrors, hasValidationError } = await validateCSVService.process(csvDataArray, school)
  if (hasValidationError) return ({ fileErrors: validationErrors, hasValidationError })
  // Generate csv with errors
  const csvHasErrors = csvData.some(p => p[6])
  if (csvHasErrors) {
    const csvBlob = await generateErrorCSVService.generate(school, headers, csvData)
    if (csvBlob.hasError) return (csvBlob.error)
    return ({
      csvErrorFile: csvBlob.file.name,
      hasValidationError: true
    })
  } else {
    // Save pupils if validation is successful
    let pupilIds = []
    let savedPupils = await pupilDataService.insertMany(pupils)
    if (!savedPupils) return (new Error('No pupils were saved'))
    savedPupils.map((p) => pupilIds.push(p._id))
    pupilIds = JSON.stringify(pupilIds)
    return ({ pupils: savedPupils, pupilIds })
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
        const response = await onCSVReadComplete(csvDataArray, school)
        return resolve(response)
      })
  })
  return pr
}
