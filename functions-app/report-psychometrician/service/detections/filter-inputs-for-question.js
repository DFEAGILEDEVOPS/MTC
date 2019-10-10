'use strict'
const { filter } = require('ramda')

const filterInputsForQuestion = function (questionNumber, factor1, factor2, inputs) {
  const filteredInputs = filter(
    i => i.sequenceNumber === questionNumber && i.question === `${factor1}x${factor2}`,
    inputs)
  return filteredInputs
}

module.exports = filterInputsForQuestion
