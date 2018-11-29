'use strict'
function validateMessage (pupilPrefsMessage) {
  if (!pupilPrefsMessage) {
    throw new Error('pupil-prefs: Message missing')
  }
  if (!(typeof pupilPrefsMessage === 'object')) {
    throw new Error('pupil-prefs: Message is invalid')
  }
  if (!pupilPrefsMessage.version) {
    throw new Error('pupil-prefs: Message version is unspecified')
  }
  if (!pupilPrefsMessage.checkCode) {
    throw new Error('pupil-prefs: Message is invalid: checkCode missing')
  }
  if (!pupilPrefsMessage.preferences) {
    throw new Error('pupil-prefs: Preferences are missing')
  }
  if (!(typeof pupilPrefsMessage.preferences === 'object')) {
    throw new Error('pupil-prefs: Preferences are invalid')
  }
  if (!pupilPrefsMessage.preferences.fontSizeCode || !pupilPrefsMessage.preferences.colourContrastCode) {
    throw new Error('pupil-prefs: One or more pupil preference code values are missing')
  }
}
module.exports = validateMessage
