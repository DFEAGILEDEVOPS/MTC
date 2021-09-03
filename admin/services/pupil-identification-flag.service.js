const dateService = require('../services/date.service')
const sortService = require('../helpers/table-sorting')
const R = require('ramda')
/**
 * @typedef {object} IdentifiedPupil
 * @property {string} foreName
 * @property {string} lastName
 * @property {string} middleNames
 * @property {moment.Moment} dateOfBirth
 * @property {string} formattedDateOfBirth - added
 * @property {string} fullName - added
 * @property {boolean} showDoB - added
 * @property {boolean} showMiddleNames - added
 *
 */

/**
 * @typedef Pupil
 * @property {string} foreName
 * @property {string} lastName
 * @property {string} middleNames
 * @property {moment.Moment} dateOfBirth
 */

const pupilIdentificationFlag = {
  /**
   *
   * @param {Pupil | IdentifiedPupil} p1
   * @param {Pupil | IdentifiedPupil} p2
   * @returns {boolean}
   */
  haveEqualFullNames: function haveEqualFullNames (p1, p2) {
    return p1.foreName.toLowerCase() === p2.foreName.toLowerCase() && p1.lastName.toLowerCase() === p2.lastName.toLowerCase()
  },

  /**
   * Private useful utility function to provide dynamic defaults for a pupil
   * @param {Pupil} pupil
   * @return {{fullName: string, showDoB: boolean, showMiddleNames: boolean, formattedDateOfBirth: string}}
   */
  getDefaultIdentifiedPupilProps: function getDefaultIdentifiedPupilProps (pupil) {
    return {
      showDoB: false,
      showMiddleNames: false,
      formattedDateOfBirth: dateService.formatShortGdsDate(pupil.dateOfBirth),
      fullName: R.propOr(`${pupil.lastName}, ${pupil.foreName}`, 'fullName', pupil)
    }
  },

  /**
   * Add identification flags by comparing two pupils
   * @param {Pupil | IdentifiedPupil} p1 - first pupil
   * @param {Pupil | IdentifiedPupil} p2 - second pupil
   * @returns [IdentifiedPupil, IdentifiedPupil]
   */
  compareTwoPupils: function compareTwoPupils (p1, p2) {
    const r1 = R.mergeLeft(p1, this.getDefaultIdentifiedPupilProps(p1))
    const r2 = R.mergeLeft(p2, this.getDefaultIdentifiedPupilProps(p2))
    if (pupilIdentificationFlag.haveEqualFullNames(p1, p2)) {
      r1.showDoB = true
      r2.showDoB = true
    }
    if (p1.dateOfBirth.toString() === p2.dateOfBirth.toString()) {
      r1.fullName = `${p1.lastName}, ${p1.foreName} ${p1.middleNames}`
      r2.fullName = `${p2.lastName}, ${p2.foreName} ${p2.middleNames}`
      r1.showMiddleNames = true
      r2.showMiddleNames = true
      r1.showDoB = false
      r2.showDoB = false
    }
    return [r1, r2]
  },

  /**
   * Clone a Pupil and add default property with dynamic defaults for the pupil
   * @param {Pupil} pupil
   * @returns {IdentifiedPupil}
   */
  clonePupilWithDefaults: function clonePupilWithDefaults (pupil) {
    return R.mergeLeft(pupil, this.getDefaultIdentifiedPupilProps(pupil))
  },

  /**
   * Clone an array of Pupils and return IdentifiedPupils with appropriate defaults
   * @param {Pupil[]} pupils
   * @returns {IdentifiedPupil[]}
   */
  clonePupilsWithDefaults: function clonePupilsWithDefaults (pupils) {
    return pupils.map(p => this.clonePupilWithDefaults(p))
  },

  /**
   * Add disambiguation meta information to be used by the presentation layer when showing lists of pupils.
   * The input argument MUST be sorted for this to work correctly (same the initial version)
   * @param pupils
   */
  addIdentificationFlags: function addIdentificationFlags (pupils) {
    const identifiedPupils = this.clonePupilsWithDefaults(pupils)
    for (let i = 0; i < identifiedPupils.length - 1; i++) {
      const compResult = this.compareTwoPupils(identifiedPupils[i], identifiedPupils[i + 1])
      identifiedPupils[i] = compResult[0]
      identifiedPupils[i + 1] = compResult[1]
    }
    return identifiedPupils
  },

  /**
   * Sort and add identification flags
   * This is preferred to doing your own sorting (in both code and SQL), as it sorts correctly and uses the web-tier
   * which is designed for scaling; where the database is not.
   * @param {Pupil[]} pupils
   * @returns {IdentifiedPupil[]}
   */
  sortAndAddIdentificationFlags: function sortAndAddIdentificationFlags (pupils) {
    const sorted = sortService.sortByProps(['lastName', 'foreName', 'dateOfBirth', 'middleNames'], pupils)
    return this.addIdentificationFlags(sorted)
  }
}

module.exports = pupilIdentificationFlag
