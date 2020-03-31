'use strict'

const dataService = require('./data-access/school-summary.data.service')

const service = {}

/**
 * @description get check activity summary
 * @param {number} schoolId
 * @return {Promise<object>}
 */
service.getSummary = async (schoolId) => {
  const registerData = await dataService.getRegisterSummaryData(schoolId)
  return {
    schoolName: '[A very good school with a suitably long and descriptive name]',
    dfeNumber: '[DFE Number]',
    register: {
      completed: registerData.Completed,
      total: registerData.TotalCount,
      notTaking: registerData.NotAttending
    },
    liveCheckSummary: [
      {
        Date: '7th June',
        PinsGenerated: 59,
        LoggedIn: 52,
        StartedCheck: 44
      },
      {
        Date: '14th May',
        PinsGenerated: 13,
        LoggedIn: 11,
        StartedCheck: 4
      },
      {
        Date: '3rd May',
        PinsGenerated: 19,
        LoggedIn: 8,
        StartedCheck: 8
      }],
    tioCheckSummary: [
      {
        Date: '4th April',
        PinsGenerated: 59,
        LoggedIn: 52,
        StartedCheck: 44
      },
      {
        Date: '15th May',
        PinsGenerated: 13,
        LoggedIn: 11,
        StartedCheck: 4
      },
      {
        Date: '16th May',
        PinsGenerated: 19,
        LoggedIn: 8,
        StartedCheck: 8
      }
    ]
  }
}

module.exports = service
