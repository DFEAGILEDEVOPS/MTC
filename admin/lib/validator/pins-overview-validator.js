const pinsOverviewErrorMessages = require('../errors/pins-overview')

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
    return pinsOverviewErrorMessages.noCheckWindowAndForms
  }
  if (!hasCheckWindow) {
    return pinsOverviewErrorMessages.noCurrentCheckWindow
  }
  if (!hasCheckForms) {
    return pinsOverviewErrorMessages.noCheckFormsAssigned
  }
}
