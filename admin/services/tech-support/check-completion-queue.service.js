'use strict'

const service = {
  createMessageForSingleCheck: async function createMessageForSingleCheck (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode parameter is required')
    }
    throw new Error('not implemented')
  },

  createMessagesForSchool: async function createMessagesForSchool (schoolUuid) {
    if (!schoolUuid) {
      throw new Error('schoolUuid parameter is required')
    }
    throw new Error('not implemented')
  }

}

module.exports = service
