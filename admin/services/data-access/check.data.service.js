'use strict'

const Check = require('../../models/check')
const checkDataService = {}

/**
 * Find a Check and return the lean model
 * @param checkCode
 * @return {Promise}
 */
checkDataService.findOneByCheckCode = async (checkCode) => {
  return Check.findOne({checkCode}).lean().exec()
}

module.exports = checkDataService
