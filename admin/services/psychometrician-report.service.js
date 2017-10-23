'use strict'

const psCachedReportDataService = require('./data-access/ps-report-cache.data.service')
const completedCheckDataService = require('./data-access/completed-check.data.service')
const checkDataService = require('./data-access/check.data.service')
const dateService = require('./date.service')

const psychometricianReportService = {}

psychometricianReportService.generateReport = async function () {
}

psychometricianReportService.batchProduceCacheData = async function (batchIds) {
  if (!batchIds) {
    throw new Error('Missing argument: batchIds')
  }

  if (!(Array.isArray(batchIds) && batchIds.length)) {
    throw new Error('Invalid arg: batchIds')
  }

  const completedChecks = await completedCheckDataService.find({_id: {'$in': batchIds}})
  await this.populateWithCheck(completedChecks)

  for (let check of completedChecks) {
    await this.produceCacheData(check)
  }
}

psychometricianReportService.produceCacheData = async function (completedCheck) {
  if (!completedCheck) {
    throw new Error('Missing argument: completedCheck')
  }

  if (!(typeof completedCheck === 'object' && completedCheck._id)) {
    throw new Error('Invalid argument: completedCheck')
  }

  const psData = {
    'AttemptId': completedCheck.check.checkCode,
    'DOB': dateService.formatUKDate(completedCheck.check.pupilId.dob),
    // 'estab': answer.school.estabCode,
    // 'FakeForename': 'Pupil',
    // 'FormMark': answer.result ? answer.result.correct : 'n/a',
    // 'FakeGender': answer.pupil.gender,
    // 'hardwareid': '',
    // 'lanum': answer.school.leaCode,
    // 'middlenames': '',
    // 'PupilId': '',
    // 'schnam': answer.school.name,
    // 'schoolurn': answer.school.urn,
    // 'FakeSurname': 'Pupil',
    // 'T1attend': 2,
    // 'T1attend_AR': '',
    // 'T1Name': 'June Trial',
    // 'TestDate': moment(answer.creationDate).format('YYYYMMDD'),
    // 'TimeComplete': moment(answer.pupil.checkEndDate).format('h:mm:ss a'),
    // 'TimeStart': moment(answer.pupil.checkStartDate).format('h:mm:ss a'),
    // 'TimeTaken': moment(moment(answer.pupil.checkEndDate).diff(moment(answer.pupil.checkStartDate))).format('HH:mm:ss'),
    // 'AppId': answer.isElectron ? 'electron' : 'web'
  }
  console.log(psData)
}

/**
 * Add the Check collection information to the completedChecks by modifying the object directly
 * TODO: refactor the db to make completedChecks.check a 'ref' and remove this code
 * @param completedChecks
 * @return {Promise.<void>}
 */
psychometricianReportService.populateWithCheck = async function (completedChecks) {
  const checkCodes = completedChecks.map(c => c.data.pupil.checkCode)
  const checks = await checkDataService.findFullyPopulated({checkCode: {'$in': checkCodes}})
  const checksByCheckCode = new Map()
  // populate the map
  checks.map(c => checksByCheckCode.set(c.checkCode, c))
  // splice it in
  for (const cc of completedChecks) {
    cc.check = checksByCheckCode.get(cc.data.pupil.checkCode)
    console.log('CC Check', cc.check)
  }
}

module.exports = psychometricianReportService
