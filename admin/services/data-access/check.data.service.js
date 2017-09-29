'use strict'

const Check = require('../../models/check')
const checkDataService = {}

checkDataService.findOneByCheckCode = async (checkCode) => {
  return Check.findOne({checkCode}).lean().exec()
}

module.exports = checkDataService
