'use strict'

const serviceMessagePresenter = {}

/**
 * Returns the flash message for creating or editing the service message
 * @param {string} requestData
 * @returns {string} flashMessage
 */
serviceMessagePresenter.getFlashMessage = (requestData) =>
  requestData.isEditView
    ? 'Service message has been updated' : 'Service message has been created'

module.exports = serviceMessagePresenter
