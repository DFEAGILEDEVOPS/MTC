const pupilAgeReasonDataService = require('./data-access/pupil-age-reason.data.service')

const pupilAgeReasonService = {}

/**
 * Update pupil age reason
 * @param {Number} pupilId
 * @param {String} newAgeReason
 * @param {String} existingAgeReason
 * @returns {Promise.<*>}
 */
pupilAgeReasonService.refreshPupilAgeReason = async (pupilId, newAgeReason, existingAgeReason) => {
  if (newAgeReason && !existingAgeReason) {
    return pupilAgeReasonDataService.sqlInsertPupilAgeReason(pupilId, newAgeReason)
  }
  if (newAgeReason && existingAgeReason) {
    return pupilAgeReasonDataService.sqlUpdatePupilAgeReason(pupilId, newAgeReason)
  }

  if (!newAgeReason && existingAgeReason) {
    return pupilAgeReasonDataService.sqlRemovePupilAgeReason(pupilId)
  }
}

module.exports = pupilAgeReasonService
