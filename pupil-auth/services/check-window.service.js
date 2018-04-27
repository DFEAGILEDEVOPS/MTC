'use strict'

const checkWindowDataService = require('./data-access/check-window.data.service')
const checkDataService = require('./data-access/check.data.service')

const checkWindowService = {
  /**
   * Get current check windows and count forms assigned.
   * @returns {Promise<*|null>}
   */
  getCurrentCheckWindowsAndCountForms: async () => {
    let checkWindowsList = null
    let checkWindowsListData = await checkWindowDataService.sqlFindCurrentAndFutureWithFormCount()
    if (checkWindowsListData) {
      checkWindowsList = checkWindowsListData.map((cw) => {
        return {
          'id': cw.id,
          'checkWindowName': cw.name,
          'totalForms': cw.FormCount
        }
      })
    }
    return checkWindowsList
  },

  /**
   * Check if pupil is allowed to log in
   * @param pupilId
   * @returns {Object}
   */
  getActiveCheckWindow: async (pupilId) => {
    const currentCheck = await checkDataService.sqlFindOneForPupilLogin(pupilId)
    if (!currentCheck) throw new Error(`There is no check record for pupil id ${pupilId}`)
    const activeCheckWindow = await checkWindowDataService.sqlFindOneActiveCheckWindow(currentCheck.checkWindow_id)
    if (!activeCheckWindow) throw new Error('There is no open check window')
    return activeCheckWindow
  }
}

module.exports = checkWindowService
