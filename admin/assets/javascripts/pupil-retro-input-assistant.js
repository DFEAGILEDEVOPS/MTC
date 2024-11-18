'use strict'

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil access arrangements selection
 */

(function () {
  window.MTCAdmin.retroInputAssistant = function () {
    // Add/Remove red border to autocomplete input container
    if ($('#selectAccessArrangementsPupil').hasClass('govuk-form-group--error')) {
      $('#pupil-autocomplete-container').css('border', '4px solid #b10e1e')
    } else {
      $('#pupil-autocomplete-container').css('border', '2px solid')
    }
    // Clear selected pupil if empty value is submitted to the backend
    $('#save-input-assistant').click(function () {
      var autocompleteListBox = $('#pupil-autocomplete-container__listbox')[0]
      if (autocompleteListBox && autocompleteListBox.children.length === 0) {
        $('select[name=pupilUrlSlug]').prop('selectedIndex', 0)
      }
    })
  }
})()
