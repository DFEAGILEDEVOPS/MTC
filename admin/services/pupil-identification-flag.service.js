const dateService = require('../services/date.service')
const monitor = require('../helpers/monitor')
const pupilIdentificationFlag = {}

/**
 * Adds show Date of Birth flag for pupils that have been alphabetically sorted by last name and have equal full names
 * @param {Array} pupils
 * @returns {Array}
 */
pupilIdentificationFlag.addIdentificationFlags = (pupils) => {
  pupils.forEach((p, i) => {
    const currentPupil = pupils[ i ]
    const nextPupil = pupils[ i + 1 ]

    if (nextPupil === undefined) {
      currentPupil.fullName = !currentPupil.fullName ? `${currentPupil.lastName}, ${currentPupil.foreName}` : currentPupil.fullName
      return pupils
    }

    if (pupilIdentificationFlag.haveEqualFullNames(currentPupil, nextPupil)) {
      currentPupil.dateOfBirth = dateService.formatShortGdsDate(currentPupil.dateOfBirth)
      nextPupil.dateOfBirth = dateService.formatShortGdsDate(nextPupil.dateOfBirth)
      currentPupil.showDoB = true
      nextPupil.showDoB = true

      if (currentPupil.dateOfBirth.toString() === nextPupil.dateOfBirth.toString()) {
        currentPupil.fullName = `${currentPupil.lastName}, ${currentPupil.foreName} ${currentPupil.middleNames}`
        nextPupil.fullName = `${nextPupil.lastName}, ${nextPupil.foreName} ${nextPupil.middleNames}`
        currentPupil.showMiddleNames = true
        nextPupil.showMiddleNames = true
      }
    }
    currentPupil.fullName = !currentPupil.fullName ? `${currentPupil.lastName}, ${currentPupil.foreName}` : currentPupil.fullName
    nextPupil.fullName = !nextPupil.fullName ? `${nextPupil.lastName}, ${nextPupil.foreName}` : nextPupil.fullName
  })
  return pupils
}

pupilIdentificationFlag.haveEqualFullNames = (p1, p2) => p1.foreName.toLowerCase() === p2.foreName.toLowerCase() &&
p1.lastName.toLowerCase() === p2.lastName.toLowerCase()

module.exports = monitor('pupil-identification-flag.service', pupilIdentificationFlag)
