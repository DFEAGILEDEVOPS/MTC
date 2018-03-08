const serviceManagerErrorMessages = require('../errors/service-manager')
const testDeveloperErrorMessages = require('../errors/test-developer')

/**
 * Validate check window and related check forms
 * @param {Object} checkWindow
 * @param {Array} allForms
 * @returns {String}
 */
module.exports.validate = (checkWindow, allForms) => {
  const hasCheckWindow = !!checkWindow
  const hasCheckForms = allForms && allForms.length > 0
  if (!hasCheckWindow && !hasCheckForms) {
    return serviceManagerErrorMessages.noCheckWindowAndForms
  }
  if (!hasCheckWindow) {
    return serviceManagerErrorMessages.noCurrentCheckWindow
  }
  if (!hasCheckForms) {
    return testDeveloperErrorMessages.noCheckFormsAssigned
  }
}
