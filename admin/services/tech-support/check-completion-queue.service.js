'use strict'

const R = require('ramda')
const dataService = require('../data-access/tech-support/check-completion-queue.data.service')
const sqlService = require('../data-access/sql.service')

const service = {
  createMessageForSingleCheck: async function createMessageForSingleCheck (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode parameter is required')
    }
    const schoolUuid = await getSchoolUuidByCheckCode(checkCode)
    const receivedCheckEntity = await dataService.getReceivedCheck(schoolUuid, checkCode)
    const checkResultEntity = await dataService.getCheckResult(schoolUuid, checkCode)
    return {
      validatedCheck: receivedCheckEntity,
      markedCheck: checkResultEntity
    }
  },

  createMessagesForSchool: async function createMessagesForSchool (schoolUuid) {
    if (!schoolUuid) {
      throw new Error('schoolUuid parameter is required')
    }
    throw new Error('not implemented')
  }
}

async function getSchoolUuidByCheckCode (checkCode) {
  const result = await sqlService.query(`
    SELECT s.urlSlug FROM mtc_admin.[check] chk
      INNER JOIN mtc_admin.[pupil] p ON chk.pupil_id = p.id
      INNER JOIN mtc_admin.[school] s ON p.school_id = s.id
    WHERE chk.checkCode = @checkCode`)
  return R.head(result)
}

module.exports = service
