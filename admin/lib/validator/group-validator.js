'use strict'

const ValidationError = require('../validation-error')
const groupErrorMessages = require('../errors/group').group
const XRegExp = require('xregexp')
const { isEmpty } = require('validator')
const groupDataService = require('../../services/data-access/group.data.service')

module.exports.validate = async (groupData, oldName) => {
  let validationError = new ValidationError()

  // Group name
  if (!groupData.name || isEmpty(groupData.name.trim())) {
    validationError.addError('name', groupErrorMessages.nameIsRequired)
  }

  if (!isEmpty(groupData.name.trim())) {
    if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(groupData.name)) {
      validationError.addError('name', groupErrorMessages.nameInvalidCharacters)
    }
  }

  if (groupData.name.length > 35) {
    validationError.addError('name', groupErrorMessages.nameIsTooLong)
  }

  if (oldName !== groupData.name || !oldName) {
    const group = await groupDataService.getGroup({'name': { '$regex': new RegExp(groupData.name, 'ig') }})
    if (group !== null) {
      validationError.addError('name', groupErrorMessages.nameAlreadyExists)
    }
  }

  // Group assigned pupils
  if (!groupData.pupil || groupData.pupil.length < 1) {
    validationError.addError('pupils', groupErrorMessages.missingPupils)
  }

  return validationError
}
