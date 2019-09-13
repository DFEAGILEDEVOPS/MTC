'use strict'

const R = require('ramda')

/**
 * Remove duplicate anomaly reports ensuring of one message _type_ per question.
 * For example, perhaps because multiple inputs were recorded before the question was shown
 * @usage removeDuplicates(anomalyReports)
 */
const removeDuplicates = R.reduce(
  (accumulator, newElement) => {
    const props = ['Question number', 'Message']
    const found = R.filter(e => R.equals(
      R.pick(props, e),
      R.pick(props, newElement)),
    accumulator)

    return R.isEmpty(found) ? accumulator.concat(newElement) : accumulator
  },
  []
)

module.exports = removeDuplicates
