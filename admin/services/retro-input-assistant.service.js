'use strict'

const service = {
  /**
   * @description persists the input assistant added retrospectively
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} reason
   * @param {number} checkId
   * @param {string} pupilUuid
   * @returns {Promise<Void>}
   */
  save: async function add (firstName, lastName, reason, checkId, pupilUuid) {
    if (!firstName || firstName.length === 0) {
      throw new Error('input assistant first name is required')
    }
    if (!lastName || lastName.length === 0) {
      throw new Error('input assistant last name is required')
    }
    if (!reason || reason.length === 0) {
      throw new Error('input assistant reason is required')
    }
    if (!checkId || checkId === 0) {
      throw new Error('checkId is required')
    }
    if (!pupilUuid || pupilUuid.length === 0) {
      throw new Error('valid pupil uuid is required')
    }
  }
}

module.exports = service
