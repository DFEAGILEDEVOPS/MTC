'use strict'

const dataService = require('./data-access/school-summary.data.service')

const service = {}

/**
 * @description get check activity summary
 * @param {number} schoolId
 * @return {Promise<object>}
 */
service.getSummary = async (schoolId) => {
  const registerCall = dataService.getRegisterData(schoolId)
  const liveCheckCall = dataService.getLiveCheckData(schoolId)
  const tioCheckCall = dataService.getTioCheckData(schoolId)
  const data = await Promise.all([
    registerCall,
    liveCheckCall,
    tioCheckCall
  ])
  const registerData = data[0]
  const liveCheckData = data[1]
  const tioCheckData = data[2]
  return {
    schoolName: '[A very good school with a suitably long and descriptive name]',
    dfeNumber: '[DFE Number]',
    register: {
      completed: registerData.Completed,
      total: registerData.TotalCount,
      notTaking: registerData.NotAttending
    },
    liveCheckSummary: liveCheckData || [],
    tioCheckSummary: tioCheckData || []
  }
}

module.exports = service
