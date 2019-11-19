'use strict'
const R = require('ramda')

const pupilNamePresenter = {}

/**
 * Adds pupil name properties for pupil views
 * @returns {Array<Object>}
 */
pupilNamePresenter.createNamesForPupilView = (pupils) => {
  const addPupilViewNames = p => {
    return {
      pupilViewForeName: p.foreNameAlias || p.foreName,
      pupilViewLastName: p.lastNameAlias || p.lastName,
      ...p
    }
  }
  return R.map(addPupilViewNames, pupils)
}

module.exports = pupilNamePresenter
