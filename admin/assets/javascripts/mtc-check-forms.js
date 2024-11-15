'use strict'

/**
 * Check form submission
 */
 
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/* global $ */
(function () {
  window.MTCAdmin.checkForms = function () {
    function toggleShowHideModal (e) {
      e.preventDefault()
      $('#js-modal-overlay').toggleClass('show')
      var modalBox = $('#js-modal-box')
      if (modalBox.hasClass('show')) {
        modalBox.removeClass('show')
        $('#js-modal-link').focus()
      } else {
        modalBox.addClass('show')
        $('#js-modal-cancel-button').focus()
      }
    }

    // Display modal if familiarisation form already exists
    $('#upload-form-submit').click(function (e) {
      var hasExistingFamiliarisationCheckForm = $('#hasExistingFamiliarisationCheckForm').val()
      var selectedCheckFormType = $('input[name=checkFormType]:checked').val()
      if (selectedCheckFormType === 'F' &&
        typeof hasExistingFamiliarisationCheckForm === 'string' && JSON.parse(hasExistingFamiliarisationCheckForm)) {
        toggleShowHideModal(e)
      }
    })
    // Submit form via modal window
    $('#js-modal-confirmation-button').click(function (e) {
      e.preventDefault()
      $('#check-form-upload-form').submit()
    })
  }
})()
