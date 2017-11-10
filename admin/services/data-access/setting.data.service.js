'use strict'

const Setting = require('../../models/setting')

const settingDataService = {}

settingDataService.findOne = async function (options) {
  return Setting.findOne(options).lean().exec()
}

module.exports = settingDataService
