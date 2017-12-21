'use strict'

const settingDataService = require('./data-access/setting.data.service')
const settingLogDataService = require('./data-access/setting-log.data.service')

const settingService = {}

settingService.update = async (loadingTimeLimit, questionTimeLimit, userId) => {
  settingDataService.sqlUpdate(loadingTimeLimit, questionTimeLimit)
  settingLogDataService.sqlCreate({
    loadingTimeLimit: loadingTimeLimit,
    questionTimeLimit: questionTimeLimit,
    user_id: userId
  })
}

settingService.get = async () => {
  return settingDataService.sqlFindOne()
}

module.exports = settingService
