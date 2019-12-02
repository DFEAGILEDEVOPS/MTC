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
  return tableSorting.applySorting(tableSorting.applySorting(R.map(generatePupilPinViewData, pupils), 'pupilViewLastName', false), 'group')
}

module.exports = pupilPinPresenter
