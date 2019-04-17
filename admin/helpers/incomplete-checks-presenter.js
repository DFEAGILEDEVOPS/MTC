'use strict'

const R = require('ramda')

const incompleteChecksPresenter = {}

incompleteChecksPresenter.getPupilWithIncompleteChecks = (pupils) => {
  return R.filter(p => p.outcome === 'Incomplete', pupils)
}

module.exports = incompleteChecksPresenter
