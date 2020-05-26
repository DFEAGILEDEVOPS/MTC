'use strict'

/**
 * @description freezes the object and child objects
 * @param {object} object - the object to deep freeze
 * @returns {object}
 */
function deepFreeze (object) {
  var propNames = Object.getOwnPropertyNames(object)
  for (const name of propNames) {
    const value = object[name]
    if (value && typeof value === 'object') {
      deepFreeze(value)
    }
  }
  return Object.freeze(object)
}

module.exports = deepFreeze
