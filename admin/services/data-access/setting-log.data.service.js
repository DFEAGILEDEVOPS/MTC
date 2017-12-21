'use strict'

const SettingLog = require('../../models/setting-log')
const sqlService = require('../data-access/sql.service')

const settingLogDataService = {}

/**
 * Create a new settingLog record in the DB
 * @param data { questonTimeLimit, loadingTimeLimit, user_id }
 * @return {Promise.<*>}
 */
settingLogDataService.sqlCreate = async function (data) {
  const table = '[settingsLog]'
  return sqlService.create(table, data)
}

/**
 * Create a new settingLog record in the DB
 * @param data
 * @return {Promise.<*>}
 */
settingLogDataService.create = async function (data) {
  const sl = new SettingLog(data)
  await sl.save()
  return sl.toObject()
}

module.exports = settingLogDataService
