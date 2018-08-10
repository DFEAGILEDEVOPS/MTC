'use strict'

const monitor = require('../helpers/monitor')

const setValidatorService = {
  /**
   * Utility function to validate that incoming form ids, match ids from objects in the second param
   * E.g. The first param is incoming form data from the UI, and the second are objects retreived from the DB
   * @param {Array.<number>} formIds
   * @param {Array.<{id: number}>} databaseObjects
   * @return {Set} difference between the arrays.  An empty difference means they have the same ids.
   */
  validate: function (formIds, databaseObjects) {
    const providedSet = new Set(formIds)
    const databaseSet = new Set(databaseObjects.map(x => x.id))
    const difference = new Set([ ...providedSet ].filter(x => !databaseSet.has(x)))
    return difference
  }
}

module.exports = monitor('set-validation.service', setValidatorService)
