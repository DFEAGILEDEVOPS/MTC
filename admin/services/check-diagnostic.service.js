'use strict'

const dataService = require('./data-access/check-diagnostic.data.service')
const schoolService = require('./school.service')
const azureTableStorageService = require('./azure-table-storage.service')

const service = {
  /**
   * @description looks up diagnostic check record by check code
   * @param {string} checkCode required, valid UUID
   * @returns single check record, or undefined if not found
   */
  getByCheckCode: async function getByCheckCode (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    return dataService.getByCheckCode(checkCode.trim())
  },

  /**
   * @description returns a marked check entity or undefined [tech-support role utility function]
   * @param {string} checkCode - valid UUID and check code
   * @returns Promise<azureTableStorageService.MarkedCheckEntity>
   */
  getMarkedCheckEntityByCheckCode: async function getMarkedCheckEntityByCheckCode (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    // We need the school UUID in order to retrieve from table storage
    const check = await service.getByCheckCode(checkCode)
    const school = await schoolService.findOneById(check.school_id)
    const markedCheckEntity = await azureTableStorageService.retrieveMarkedCheck(school.urlSlug, check.checkCode)
    return markedCheckEntity
  },

  /**
   * @description returns a marked check entity or undefined [tech-support role utility function]
   * @param {string} checkCode - valid UUID and check code
   * @returns Promise<azureTableStorageService.MarkedCheckEntity>
   */
  getReceivedCheckEntityByCheckCode: async function getReceivedCheckEntityByCheckCode (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    // We need the school UUID in order to retrieve from table storage
    const check = await service.getByCheckCode(checkCode)
    const school = await schoolService.findOneById(check.school_id)
    const receivedCheckEntity = await azureTableStorageService.retrieveReceivedCheck(school.urlSlug, check.checkCode)
    return receivedCheckEntity
  }
}

module.exports = service
