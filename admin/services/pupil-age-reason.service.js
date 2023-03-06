const pupilAgeReasonDataService = require('./data-access/pupil-age-reason.data.service')

const pupilAgeReasonService = {}

/**
 * Update pupil age reason
 * @param {number} pupilId
 * @param {string} newAgeReason
 * @param {string} existingAgeReason
 * @param {number} userId - the value from the id field of the user table
 * @returns {Promise.<*>}
 */
pupilAgeReasonService.refreshPupilAgeReason = async (pupilId, newAgeReason, existingAgeReason, userId) => {
  if (!userId) {
    throw new Error('missing userId')
  }
  if (newAgeReason && !existingAgeReason) {
    return pupilAgeReasonDataService.sqlInsertPupilAgeReason(pupilId, newAgeReason, userId)
  }
  if (newAgeReason && existingAgeReason) {
    return pupilAgeReasonDataService.sqlUpdatePupilAgeReason(pupilId, newAgeReason, userId)
  }

  if (!newAgeReason && existingAgeReason) {
    return pupilAgeReasonDataService.sqlRemovePupilAgeReason(pupilId)
  }
}

module.exports = pupilAgeReasonService
