'use strict'

const { randomUUID } = require('crypto')
const uuidValidate = require('uuid-validate')

const NIL = '00000000-0000-0000-0000-000000000000'

function v4 () {
  return randomUUID()
}

function validate (value) {
  // NIL UUID is a special case that should be valid
  if (value === NIL) {
    return true
  }
  return uuidValidate(value)
}

module.exports = {
  NIL,
  v4,
  validate
}
