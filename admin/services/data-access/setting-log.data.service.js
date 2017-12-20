'use strict'

const SettingLog = require('../../models/setting-log')
const sqlService = require('../data-access/sql.service')

const settingLogDataService = {}

/**
 * Create a new settingLog record in the DB
 * @param data
 * @return {Promise.<*>}
 */
settingLogDataService.sqlCreate = async function (data) {
  // TODO
  
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
