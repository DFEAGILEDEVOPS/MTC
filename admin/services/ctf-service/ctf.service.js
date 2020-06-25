'use strict'
const moment = require('moment-timezone')

const checkWindowV2Service = require('../check-window-v2.service')
const config = require('../../config')
const ctfDataService = require('./data-access/ctf.data.service')
const resultsPageAvailablilityService = require('../results-page-availability.service')

const ctfService = {
  /**
   * Throw and error if the user is NOT allowed to download the CTF XML file
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
      throw new Error('Unable to download CTF file as the HDF has not been signed')
    }

    const now = moment.tz(timezone || config.DEFAULT_TIMEZONE)
    const isResultsPageVisible = resultsPageAvailablilityService.isResultsFeatureAccessible(
      now,
      resultsPageAvailablilityService.getResultsOpeningDate(now, checkWindow.checkEndDate)
    )

    if (!isResultsPageVisible) {
      throw new Error('The Results page is not yet available')
    }

    // If they get this far they can download the xml file
  },

  getSchoolResultDataAsXmlString: async function getSchoolResultDataAsXmlString (schoolId, timezone) {
    const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    await ctfService.throwErrorIfDownloadNotAllowed(schoolId, checkWindow, timezone)
  }
}

module.exports = ctfService
