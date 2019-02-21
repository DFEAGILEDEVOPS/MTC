/**
 * Pupil access arrangements selection
 */
/* global $ */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.pupilForm = function () {
    $('#dob-year').on('input', function () {
      displayAgeTextArea()
    })

    $('#dob-month').on('input', function () {
      displayAgeTextArea()
    })

    $('#dob-day').on('input', function () {
      displayAgeTextArea()
    })

    function displayAgeTextArea () {
      var composedDate = $('#dob-month').val() + '/' + $('#dob-day').val() + '/' + $('#dob-year').val()
      var currentYear = (new Date()).getFullYear()
      var inputDate = new Date(composedDate)
      var agedSevenMinimumDate = new Date(currentYear - 7, 8, 1)
      var agedSevenMaximumDate = new Date(currentYear - 7, 11, 31)
      var agedTenMinimumDate = new Date(currentYear - 10, 8, 1)
      var agedTenMaximumDate = new Date(currentYear - 10, 11, 31)
      if ((inputDate >= agedSevenMinimumDate && inputDate <= agedSevenMaximumDate) ||
        (inputDate >= agedTenMinimumDate && inputDate <= agedTenMaximumDate)
      ) {
        $('.hide-age-content').addClass('show-age-content')
        $('.show-age-content').removeClass('hide-age-content')
      } else if ($('.show-age-content').length > 0) {
        $('#ageReason').val('')
        $('.show-age-content').addClass('hide-age-content')
        $('.hide-age-content').removeClass('show-age-content')
      }
    }
  }
})
