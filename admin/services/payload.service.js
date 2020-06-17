'use strict'
const moment = require('moment')
const R = require('ramda')

const payloadDataService = require('./data-access/payload.data.service')
const compressionService = require('./compression.service')
const uuidValidator = require('../lib/validator/common/uuid-validator')

/**
 * @typedef {Object} ClientTimestamp
 * @property {moment.Moment} clientTimestamp
*/

const payloadService = {
  /**
   * Add relative timings to an array of objects that have 'clientTimestamp' property
   * @param {Array<ClientTimestamp>} objects
   * @return {Array<ClientTimestamp>}
   */
  addRelativeTimingsToSection: function addRelativeTimingsToSection (objects) {
    let lastTime, current
    const output = [] // output array
    for (const obj of objects) {
      if (!obj) {
        output.push(obj)
        continue
      }

      if (!obj.clientTimestamp) {
        output.push(obj)
        continue
      }

      current = moment(obj.clientTimestamp)

      if (lastTime) {
        const secondsDiff = (
          current.valueOf() - lastTime.valueOf()
        ) / 1000
        const signAsNumber = Math.sign(secondsDiff)
        let sign = ''
        switch (signAsNumber) {
          case 1:
          case 0:
            sign = '+'
            break
          case -1:
          case -0:
            sign = '-'
        }
        output.push(R.assoc('relativeTiming', '' + sign + Math.abs(secondsDiff), obj))
      } else {
        output.push(R.assoc('relativeTiming', '+0.00', obj))
      }
      lastTime = current
    }
    return output
  },

  /**
   * @typedef {Object} Question
   * @property {number} f1
   * @property {number} f2
   */

  /**
   * Return a copy of the data with updated 'inputs' and 'audit' arrays that have relativeTiming added
   * @param check
   * @return {Question}
   */
  addRelativeTimings: function addRelativeTimings (check) {
    const r1 = R.assoc('inputs', this.addRelativeTimingsToSection(check.inputs), check)
    return R.assoc('audit', this.addRelativeTimingsToSection(check.audit), r1)
  },

  /**
   * Gets the payload
   * @param checkCode
   * @return {Promise<{}>}
   */
  getPayload: async function getPayload (checkCode) {
    if (!checkCode) {
      throw new Error('Missing checkCode')
    }

    const validationError = uuidValidator.validate(checkCode, 'checkCode')
    if (validationError && validationError.hasError && validationError.hasError()) {
      throw new Error('checkCode is not a valid UUID')
    }

    const entity = await payloadDataService.sqlFindOneByCheckCode(checkCode)

    const archive = R.pathOr('', ['result', 'archive', '_'], entity)

    if (archive.length === 0) {
      throw new Error('archive not found')
    }

    const payloadString = compressionService.decompress(archive)
    const payload = JSON.parse(payloadString)
    return this.addRelativeTimings(payload)
  }
}

module.exports = payloadService
