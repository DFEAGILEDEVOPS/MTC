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
  if (listIncludesGroups) {
    const sortedPupilsWithGroups = tableSorting.applySorting(R.map(generatePupilPinViewData, R.filter(p => p.group && p.group.length > 0, pupils)), 'group')
    const sortedPupilsWithoutGroups = tableSorting.applySorting(R.map(generatePupilPinViewData, R.filter(p => !p.group || p.group.length === 0, pupils)), 'pupilViewLastName')
    return R.concat(sortedPupilsWithGroups, sortedPupilsWithoutGroups)
  }
  return tableSorting.applySorting(R.map(generatePupilPinViewData, pupils), 'pupilViewLastName')
}

module.exports = pupilPinPresenter
