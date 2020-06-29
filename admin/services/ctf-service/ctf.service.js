'use strict'
const moment = require('moment-timezone')
const R = require('ramda')
const RA = require('ramda-adjunct')

const checkWindowV2Service = require('../check-window-v2.service')
const config = require('../../config')
const ctfDataService = require('./data-access/ctf.data.service')
const resultsPageAvailablilityService = require('../results-page-availability.service')
const resultsService = require('../result.service')
const NotAvailableError = require('../../error-types/not-available')
const pupilAttendanceCodes = require('../../lib/consts/pupil-attendance-codes')
const ctfResults = require('../../lib/consts/ctf-results')
const mtcResultsStrings = require('../../lib/consts/mtc-results')

const ctfService = {
  /**
   * Throw NotAvailableError if the user is NOT allowed to download the CTF XML file
   * @param {number} schoolId
   * @param {{id: number, checkEndDate: moment.Moment}} checkWindow
   * @return {Promise<void>}
   */
  throwErrorIfDownloadNotAllowed: async function throwErrorIfDownloadNotAllowed (schoolId, checkWindow, timezone) {
    // In order to download the CTF XML file the school must have signed the HDF and the results link must be visible.
    // Note: Some schools may still see the results, even if they did not sign the HDF after a period of time, but in
    // that case, they still do NOT get to download the results until the HDF is signed.
    // Feature ticket: 36582
    const isHdfSigned = await ctfDataService.isHdfSigned(schoolId, checkWindow.id)

    if (!isHdfSigned) {
      throw new NotAvailableError('Unable to download CTF file as the HDF has not been signed')
    }

    const now = moment.tz(timezone || config.DEFAULT_TIMEZONE)

    const isResultsPageVisible = resultsPageAvailablilityService.isResultsFeatureAccessible(
      now,
      resultsPageAvailablilityService.getResultsOpeningDate(now, checkWindow.checkEndDate)
    )

    if (!isResultsPageVisible) {
      throw new NotAvailableError('The Results page is not yet available')
    }

    // If they get this far they can download the xml file
  },

  /**
   * Get the value to be placed in the CTF XML file <ResultStatus> element
   * @param {score: null|number, pupilAttendanceCode: undefined|string, status: string} pupilResult
   * @return {string|*}
   */
  getCtfResult: function getCtfResult (pupilResult) {
    // if they have a score they took the check
    if (RA.isNotNil(pupilResult.score)) {
      return pupilResult.score
    }

    // Handle pupil not attending codes
    switch (pupilResult.pupilAttendanceCode) {
      case pupilAttendanceCodes.absent.code:
        return ctfResults.absent.code

      case pupilAttendanceCodes.workingBelowExpectation.code:
        return ctfResults.workingBelowExpectation.code

      case pupilAttendanceCodes.justArrived.code:
        return ctfResults.justArrived.code

      case pupilAttendanceCodes.leftSchool.code:
        return ctfResults.leftSchool.code

      case pupilAttendanceCodes.unableToAccess.code:
        return ctfResults.unableToAccess.code

      case pupilAttendanceCodes.incorrectRegistration.code:
        return ctfResults.incorrectRegistration.code
    }

    // handle not taken check
    if (pupilResult.status === mtcResultsStrings.didNotParticipate ||
      pupilResult.status === mtcResultsStrings.incomplete ||
      pupilResult.status === mtcResultsStrings.restartNotTaken) {
      return ctfResults.notTaken.code
    }
  },

  getSchoolResultDataAsXmlString: async function getSchoolResultDataAsXmlString (schoolId, timezone) {
    const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    await ctfService.throwErrorIfDownloadNotAllowed(schoolId, checkWindow, timezone)

    // Fetch the results. This dataset is the same as that for showing the results on screen, so should
    // already have been cached in Redis.  If not, the data will be fetched from the SQL DB.
    const schoolResults = await resultsService.getPupilResultData(schoolId)
    const xmlResults = schoolResults.map(o => {
      return R.assoc('xmlResult', this.getCtfResult(o), o)
    })
    // transform xmlResults to XML String
    return xmlResults.toString()
  }
}

module.exports = ctfService
