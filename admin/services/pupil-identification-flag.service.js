const dateService = require('../services/date.service')
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
    if (nextPupil === undefined) return
    if (pupilIdentificationFlag.haveEqualFullNames(currentPupil, nextPupil)) {
      currentPupil.dateOfBirth = dateService.formatShortGdsDate(currentPupil.dateOfBirth)
      currentPupil.showDoB = true
      nextPupil.showDoB = true
      nextPupil.dateOfBirth = dateService.formatShortGdsDate(nextPupil.dateOfBirth)
      if (currentPupil.dateOfBirth.toString() === nextPupil.dateOfBirth.toString()) {
        currentPupil.fullName = `${currentPupil.lastName}, ${currentPupil.foreName} ${currentPupil.middleNames}`
        nextPupil.fullName = `${nextPupil.lastName}, ${nextPupil.foreName} ${nextPupil.middleNames}`
      }
    }
    currentPupil.fullName = !currentPupil.fullName ? `${currentPupil.lastName}, ${currentPupil.foreName}` : currentPupil.fullName
    nextPupil.fullName = !nextPupil.fullName ? `${nextPupil.lastName}, ${nextPupil.foreName}` : nextPupil.fullName
  })
  return pupils
}

pupilIdentificationFlag.haveEqualFullNames = (p1, p2) => p1.foreName.toLowerCase() === p2.foreName.toLowerCase() &&
p1.lastName.toLowerCase() === p2.lastName.toLowerCase()

module.exports = pupilIdentificationFlag
