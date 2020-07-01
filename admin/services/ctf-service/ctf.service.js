'use strict'
const moment = require('moment-timezone')
const R = require('ramda')
const RA = require('ramda-adjunct')
const xmlBuilder2 = require('xmlbuilder2')

const checkWindowV2Service = require('../check-window-v2.service')
const config = require('../../config')
const ctfDataService = require('./data-access/ctf.data.service')
const ctfResults = require('../../lib/consts/ctf-results')
const mtcResultsStrings = require('../../lib/consts/mtc-results')
const NotAvailableError = require('../../error-types/not-available')
const pupilAttendanceCodes = require('../../lib/consts/pupil-attendance-codes')
const resultsPageAvailablilityService = require('../results-page-availability.service')
const resultsService = require('../result.service')

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
   * Get the value to be placed in the CTF XML file <Result> element
   * @param {{score: null|number, attendanceCode: null|string, status: string}} pupilResult
   * @return {string|*}
   */
  getCtfResult: function getCtfResult (pupilResult) {
    // if they have a score they took the check
    if (RA.isNotNil(pupilResult.score)) {
      return pupilResult.score
    }

    // Handle pupil not attending codes
    switch (pupilResult.attendanceCode) {
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

    // We could potentially throw here, as at this point we have run out of potential codes
    // to give to the pupil.  There is no 'unknown' or 'error' code to provide.
  },

  /**
   * Create the CTF Format XML data as a String
   * @param {{id: number, leaCode: number, estabCode: string, urn: number, name: string}} schoolData
   * @param {{upn:string, lastName:string, foreName:string, dateOfBirth:moment.Moment, gender:string, ctfResult:string|number}[]} pupilData
   * @param {number} academicYear: e.g. 2019
   * @return {*}
   */
  buildXmlString: function buildXmlString (school, pupilData, academicYear) {
    const root = xmlBuilder2.create({ version: '1.0', encoding: 'utf-8' })
      .ele('CTfile')
      .ele('Header')
      .ele('DocumentName').txt('Common Transfer File').up()
      .ele('CTFversion').txt('19.0').up()
      .ele('DateTime').txt(moment().format('YYYY-MM-DDTHH:mm:ss')).up()
      .ele('DocumentQualifier').txt('partial').up()
      .ele('SupplierID').txt('Multiplication Tables Check').up()
      .ele('SourceSchool')
      .ele('LEA').txt(school.leaCode).up()
      .ele('Estab').txt(school.estabCode).up()
      .ele('URN').txt(school.urn).up()
      .ele('SchoolName').txt(school.name).up()
      .ele('AcademicYear').txt(academicYear.toString()).up()
      .up() // SourceSchool
      .ele('DestSchool')
      .ele('LEA').txt(school.leaCode).up()
      .ele('Estab').txt(school.estabCode).up()
      .ele('URN').txt(school.urn).up()
      .up() // DestSchool
      .up() // Header
      .ele('CTFpupilData')

    for (const p of pupilData) {
      root.ele('Pupil')
        .ele('UPN').txt(p.upn).up()
        .ele('Surname').txt(p.lastName.toUpperCase()).up()
        .ele('Forename').txt(p.foreName.toUpperCase()).up()
        .ele('DOB').txt(p.dateOfBirth.format('YYYY-MM-DD')).up()
        .ele('Gender').txt(p.gender.toUpperCase()).up()
        .ele('StageAssessments')
        .ele('KeyStage')
        .ele('Stage').txt('KS2').up()
        .ele('StageAssessment')
        .ele('Locale').txt('ENG').up()
        .ele('Year').txt((academicYear + 1).toString()).up()
        .ele('Subject').txt('MAT').up()
        .ele('Method').txt('TT').up()
        .ele('Component').txt('MTC').up()
        .ele('ResultStatus').txt('R').up()
        .ele('ResultQualifier').txt('MT').up()
        .ele('Result').txt(p.ctfResult.toString()).up()
        .up() // StageAssessment
        .up() // KeyStage
        .up() // StageAssessments
    }

    const xml = root.end({ prettyPrint: true })
    return xml
  },

  /**
   * Return school and pupil results in CTF download format as XML
   * @param {number} schoolId
   * @param {string} timezone e.g. 'Europe/London' - pass the default tz from config.js if the school is not SCE
   * @return {Promise<*>}
   */
  getSchoolResultDataAsXmlString: async function getSchoolResultDataAsXmlString (schoolId, timezone) {
    const checkWindow = await checkWindowV2Service.getActiveCheckWindow()
    await ctfService.throwErrorIfDownloadNotAllowed(schoolId, checkWindow, timezone)

    // Fetch the results. This dataset is the same as that for showing the results on screen, so should
    // already have been cached in Redis.  If not, the data will be fetched from the SQL DB.

    const [pupilData, schoolData, academicYear] = await Promise.all([
      resultsService.getPupilResultData(schoolId),
      ctfDataService.getSchoolData(schoolId),
      ctfDataService.getAcademicYear()
    ])

    // The only data transformation is the <Result> element, so determine that here.
    const pupilsWithCtfResult = pupilData.pupils.map(o => {
      return R.assoc('ctfResult', this.getCtfResult(o), o)
    })

    // Build the XML
    const xmlString = this.buildXmlString(schoolData, pupilsWithCtfResult, academicYear)
    return xmlString
  }
}

module.exports = ctfService
