'use strict'
const R = require('ramda')
const tableSorting = require('./table-sorting')

const pupilPinPresenter = {}

const generatePupilPinViewData = p => ({
  pupilViewForeName: p.foreNameAlias || p.foreName,
  pupilViewLastName: p.lastNameAlias || p.lastName,
  ...p
})

/**
 * Prepares pupil data for the active pins view
 * @returns {Array<Object>}
 */
pupilPinPresenter.getPupilPinViewData = (pupils) => {
  const pupilsWithAliases = R.map(generatePupilPinViewData, pupils)
  const listIncludesGroups = R.any(p => p.group && p.group.length > 0, pupils)
  if (listIncludesGroups) {
    const sortedPupilsWithGroups = pupilPinPresenter.sortPupilsByGroupAndLastName(R.filter(p => p.group && p.group.length > 0, pupilsWithAliases))
    const sortedPupilsWithoutGroups = tableSorting.applySorting(R.filter(p => !p.group || p.group.length === 0, pupilsWithAliases), 'pupilViewLastName')
    return R.concat(sortedPupilsWithGroups, sortedPupilsWithoutGroups)
  }
  return tableSorting.applySorting(pupilsWithAliases, 'pupilViewLastName')
}

pupilPinPresenter.sortPupilsByGroupAndLastName = (pupils) => {
  const sortedByGroups = tableSorting.applySorting(pupils, 'group')
  const groups = [...new Set(sortedByGroups.map(p => p.group))]
  const result = []
  groups.forEach(g => {
    const groupedPupils = sortedByGroups.filter(p => p.group === g)
    tableSorting.applySorting(groupedPupils, 'pupilViewLastName')
    groupedPupils.forEach(gp => result.push(gp))
  })
  return result
}

module.exports = pupilPinPresenter
