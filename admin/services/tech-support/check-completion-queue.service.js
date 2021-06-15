'use strict'

const dataService = require('../data-access/tech-support/check-completion-queue.data.service')

const service = {
  createMessageForSingleCheck: async function createMessageForSingleCheck (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode parameter is required')
    }
    const schoolUuid = await dataService.getSchoolUuidByCheckCode(checkCode)
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

module.exports = service
