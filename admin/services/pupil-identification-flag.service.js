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
    if (currentPupil.foreName === nextPupil.foreName && currentPupil.lastName === nextPupil.lastName &&
      currentPupil.dob === nextPupil.dob) {
      currentPupil.showMiddleNames = true
      nextPupil.showMiddleNames = true
    }
    if (currentPupil.foreName === nextPupil.foreName && currentPupil.lastName === nextPupil.lastName) {
      currentPupil.showDoB = true
      nextPupil.showDoB = true
    }
  })
  return pupils
}

module.exports = pupilIdentificationFlag
