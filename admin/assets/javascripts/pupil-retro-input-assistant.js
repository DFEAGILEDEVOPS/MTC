'use strict'

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil access arrangements selection
 */
/* global $ */
(function () {
  window.MTCAdmin.retroInputAssistant = function () {
    // Add/Remove red border to autocomplete input container
    if ($('#selectAccessArrangementsPupil').hasClass('govuk-form-group--error')) {
      $('#pupil-autocomplete-container').css('border', '4px solid #b10e1e')
    } else {
      $('#pupil-autocomplete-container').css('border', '2px solid')
    }
    // Clear selected pupil if empty value is submitted to the backend
    $('#save-input-assistant').click(function (e) {
      var autocompleteListBox = $('#pupil-autocomplete-container__listbox')[0]
      if (autocompleteListBox && autocompleteListBox.children.length === 0) {
        $('select[name=pupilUrlSlug]').prop('selectedIndex', 0)
      }
      // Edit mode only: Display modal only when no checkboxes are checked
      var isEditView = $('#isEditView')[0]
      if (isEditView && $('input:checkbox:checked').length === 0) {
        toggleShowHideModal(e)
      }
    })
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
  }
})()
