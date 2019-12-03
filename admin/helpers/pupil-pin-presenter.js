'use strict'
const R = require('ramda')
const tableSorting = require('./table-sorting')

const pupilPinPresenter = {}

/**
 * Prepares pupil data for the active pins view
 * @returns {Array<Object>}
 */
pupilPinPresenter.getPupilPinViewData = (pupils) => {
  const generatePupilPinViewData = p => ({
    pupilViewForeName: p.foreNameAlias || p.foreName,
    pupilViewLastName: p.lastNameAlias || p.lastName,
    ...p
  })
  const listIncludesGroups = R.any(p => p.group && p.group.length > 0, pupils)
  return listIncludesGroups
    ? tableSorting.applySorting(tableSorting.applySorting(R.map(generatePupilPinViewData, pupils), 'pupilViewLastName', false), 'group')
    : tableSorting.applySorting(R.map(generatePupilPinViewData, pupils), 'pupilViewLastName')
}

module.exports = pupilPinPresenter
