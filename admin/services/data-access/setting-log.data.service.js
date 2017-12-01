'use strict'

const SettingLog = require('../../models/setting-log')
const settingLogDataService = {}

settingLogDataService.create = async function (data) {
  const sl = new SettingLog(data)
  await sl.save()
  return sl.toObject()
}

module.exports = settingLogDataService
