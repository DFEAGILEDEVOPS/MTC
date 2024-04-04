'use strict'
/* eslint-disable no-var */
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/**
 * Pupil access arrangements selection
 */
/* global $ */
(function () {
  window.MTCAdmin.accessArrangements = function () {
    // Reveal hidden content if the checkbox or radio button appears selected on page load
    if ($('input[value=ITA]').is(':checked')) {
      $($('input[value=ITA]').closest('li')).find('.hide-checkbox-content').addClass('show-checkbox-content')
      $($('input[value=ITA]').closest('li')).find('.show-checkbox-content').removeClass('hide-checkbox-content')
    }
    if ($('input[value=QNR]').is(':checked')) {
      $($('input[value=QNR]').closest('li')).find('.hide-checkbox-content').addClass('show-checkbox-content')
      $($('input[value=QNR]').closest('li')).find('.show-checkbox-content').removeClass('hide-checkbox-content')
    }
    if ($('input[value=NBQ]').is(':checked')) {
      $($('input[value=NBQ]').closest('li')).find('.hide-checkbox-content').addClass('show-checkbox-content')
      $($('input[value=NBQ]').closest('li')).find('.show-checkbox-content').removeClass('hide-checkbox-content')
    }
    if ($('input[value=OTH]').is(':checked')) {
      $($('input[value=OTH]').parent().siblings('.govuk-inset-text')).removeClass('govuk-visually-hidden')
    }
    // Add/Remove red border to autocomplete input container
    if ($('#selectAccessArrangementsPupil').hasClass('govuk-form-group--error')) {
      $('#pupil-autocomplete-container').css('border', '4px solid #b10e1e')
    } else {
      $('#pupil-autocomplete-container').css('border', '2px solid')
    }
    // Clear selected pupil if empty value is submitted to the backend
    $('#save-access-arrangement').click(function (e) {
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
    // Submit form via modal window
    $('#js-modal-confirmation-button').click(function (e) {
      e.preventDefault()
      var pupilUrlSlug = $('#urlSlug').val()
      var deleteUrl = '/access-arrangements/delete-access-arrangements/' + pupilUrlSlug
      window.location.replace(deleteUrl)
    })
  }
})()
