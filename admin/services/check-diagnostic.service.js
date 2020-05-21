'use strict'

const dataService = require('./data-access/check-diagnostic.data.service')

const service = {
  /**
   * @description looks up diagnostic check record by check code
   * @param {string} checkCode required, valid UUID
   * @returns single check record, or undefined if not found
   */
  getByCheckCode: function getByCheckCode (checkCode) {
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    return dataService.getByCheckCode(checkCode)
  }
}

module.exports = service
