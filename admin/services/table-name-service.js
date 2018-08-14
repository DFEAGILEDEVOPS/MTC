'use strict'
const config = require('../config')
const R = require('ramda')

const NAMES = {
  PREPARED_CHECK: 'preparedCheck'
}

Object.freeze(NAMES)

const nameService = {
  /**
   * Returns the correct table name for the environment based on a key.
   * E.g.
   * @param tableName - the basic queue name
   * @return {string}
   */
  getName: function (tableName) {
    const prefix = config.Azure.tablePrefix

    const lookupKey = getKeyFromValue(tableName)

    if (!NAMES.hasOwnProperty(lookupKey)) {
      throw new Error('Table name not found: ' + tableName)
    }

    // If the config prefix is an empty string - there is nothing to do, so return the queue name as it is.
    if (!prefix) {
      return tableName
    }

    const stem = capitalise(tableName)

    // Can't use dashes here - our naming convention is camelCase for table names
    return `${prefix}${stem}`
  },

  NAMES
}

const capitalise = R.compose(
  R.join(''),
  R.juxt([R.compose(R.toUpper, R.head), R.tail])
)

const getKeyFromValue = function (value) {
  return value.replace(/[A-Z]{1}/, '_$&').toUpperCase()
}

module.exports = nameService
