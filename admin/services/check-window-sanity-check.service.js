const checkFormService = require('../services/check-form.service')
const checkWindowDataService = require('../services/data-access/check-window.data.service')
const serviceManagerErrorMessages = require('../lib/errors/service-manager')
const testDeveloperErrorMessages = require('../lib/errors/test-developer')

const checkWindowSanityCheckService = {}

/**
 * Detects possible check form and check window error that should prevent pin generation
 * @returns {String}
 */

checkWindowSanityCheckService.check = async () => {
  const checkWindow = await checkWindowDataService.sqlFindOneCurrent()
  let allForms = []
  if (checkWindow && checkWindow.id) {
    allForms = await checkFormService.getAllFormsForCheckWindow(checkWindow.id)
  }
  const hasCheckWindow = !!checkWindow
  const hasCheckForms = allForms && allForms.length > 0
  if (!hasCheckWindow) {
    return serviceManagerErrorMessages.noCurrentCheckWindow
  }
  if (!hasCheckForms) {
    return testDeveloperErrorMessages.noCheckFormsAssigned
  }
}

module.exports = checkWindowSanityCheckService
