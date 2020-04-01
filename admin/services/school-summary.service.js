'use strict'

const dataService = require('./data-access/school-summary.data.service')

const service = {}

/**
 * @description get check activity summary
 * @param {number} schoolId
 * @return {Promise<object>}
 */
service.getSummary = async (schoolId) => {
  const registerData = dataService.getRegisterData(schoolId)
  const liveCheckData = dataService.getLiveCheckData(schoolId)
  const tioCheckData = dataService.getTioCheckData(schoolId)
  await Promise.all([
    registerData,
    liveCheckData,
    tioCheckData
  ])
  return {
    schoolName: '[A very good school with a suitably long and descriptive name]',
    dfeNumber: '[DFE Number]',
    register: {
      completed: registerData.Completed,
      total: registerData.TotalCount,
      notTaking: registerData.NotAttending
    },
    liveCheckSummary: liveCheckData,
    tioCheckSummary: tioCheckData
  }
}

module.exports = service
