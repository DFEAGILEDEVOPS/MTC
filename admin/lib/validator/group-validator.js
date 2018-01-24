'use strict'

const ValidationError = require('../validation-error')
const groupErrorMessages = require('../errors/group').group
const XRegExp = require('xregexp')
const { isEmpty } = require('validator')
const groupDataService = require('../../services/data-access/group.data.service')

module.exports.validate = async (groupData, oldName, schoolId) => {
  let validationError = new ValidationError()
  let isValid = false

  // Group name
  if (!groupData.name || isEmpty(groupData.name.trim())) {
    validationError.addError('name', groupErrorMessages.nameIsRequired)
  }

  if (!isEmpty(groupData.name.trim())) {
    // Allow only latin alphabet characters, numbers, hyphens and single quotes.
    if (!XRegExp('^[\\p{Latin}-\' 0-9]+$').test(groupData.name.trim())) {
      validationError.addError('name', groupErrorMessages.nameInvalidCharacters)
      isValid = true
    }
  }

  if (groupData.name.length >= 35) {
    validationError.addError('name', groupErrorMessages.nameIsTooLong)
    isValid = true
  }

  // Don't query the DB if at this point group name is not valid.
  if (((oldName && oldName.toLowerCase() !== groupData.name.trim().toLowerCase()) || !oldName) && !isValid) {
    const group = await groupDataService.sqlFindOneByName(groupData.name.trim(), schoolId)
    if (group) {
      validationError.addError('name', groupData.name.trim() + groupErrorMessages.nameAlreadyExists)
    }
  }

  // Group assigned pupils
  if (!groupData.pupil || groupData.pupil.length < 1) {
    validationError.addError('pupils', groupErrorMessages.missingPupils)
  }

  return validationError
}
