'use strict'

const setValidatorService = {
  /**
   * Utility function to validate that incoming form ids, match ids from objects in the second param
   * E.g. The first param is incoming form data from the UI, and the second are objects retrieved from the DB
   * @param {Array.<number>} numberList
   * @param {Array.<{id: number}>} databaseObjects
   * @return {Set} difference between the arrays.  An empty difference means they have the same ids.
   */
  validate: function (numberList, databaseObjects) {
    const providedSet = new Set(numberList)
    const databaseSet = new Set(databaseObjects.map(x => x.id))
    const difference = new Set([...providedSet].filter(x => !databaseSet.has(x)))
    return difference
  }
}

module.exports = setValidatorService
