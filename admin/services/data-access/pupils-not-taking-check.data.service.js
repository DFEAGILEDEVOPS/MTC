'use strict'

const Pupil = require('../../models/pupil')
const pupilsNotTakingCheckDataService = {}

/**
 *
 * @param schoolId
 * @returns {Promise.<*>}
 */
pupilsNotTakingCheckDataService.fetchPupilsWithReasons = async (schoolId) => {
  let pupilsWithReasons
  pupilsWithReasons = await Pupil
    .find({'attendanceCode': {$exists: true}, 'school': schoolId})
    .sort('lastName')
  return pupilsWithReasons
}

module.exports = pupilsNotTakingCheckDataService
