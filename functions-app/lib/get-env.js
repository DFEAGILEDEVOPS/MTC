'use strict'

const toBool = require('to-bool')
const R = require('ramda')

const cast = {
  toInt: i => parseInt(i, 10),
  toNumber: i => Number(i),
  toBoolean: b => toBool(b)
}

function getEnvWithTypeOrDefault (prop, castFunction = null, orDefault = null, dataObj) {
  if (R.has(prop, dataObj)) { // own property
    const val = R.prop(prop, dataObj)
    if (typeof castFunction === 'function') {
      return castFunction(val)
    }
    return val
  } else {
    return orDefault
  }
}

module.exports = {
  getEnvWithTypeOrDefault,
  cast
}
