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
      var academicYear = window.GOVUK.determineAcademicYear()
      var inputDate = new Date(composedDate)
      if ((window.GOVUK.isWithinAcademicYear(inputDate, academicYear, 11) ||
        window.GOVUK.isWithinAcademicYear(inputDate, academicYear, 8)) && $('#dob-year').val().length === 4) {
        $('.hide-age-content').addClass('show-age-content')
        $('.show-age-content').removeClass('hide-age-content')
      } else if ($('.show-age-content').length > 0) {
        $('#ageReason').val('')
        $('.show-age-content').addClass('hide-age-content')
        $('.hide-age-content').removeClass('show-age-content')
      }
    }
  }

  window.GOVUK.determineAcademicYear = function () {
    var currentDate = new Date()
    var currentYear = (currentDate).getFullYear()
    var startOfJanuary = new Date(currentYear, 0, 1)
    var endOfAugust = new Date(currentYear, 7, 31)
    if (currentDate >= startOfJanuary && currentDate <= endOfAugust) {
      return currentYear - 1
    }
    return currentYear
  }

  window.GOVUK.isWithinAcademicYear = function (inputDate, academicYear, targetYear) {
    var targetAcademicYear = academicYear - targetYear
    return inputDate >= new Date(targetAcademicYear, 8, 2) &&
      inputDate <= new Date(targetAcademicYear + 1, 8, 1)
  }
})
