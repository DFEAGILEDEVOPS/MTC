'use strict'
 
/**
 * Pupil access arrangements selection
 */

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/* global $ */
(function () {
  window.MTCAdmin.pupilForm = function () {
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
      var composedDate = $('#dob-year').val() + '-' + $('#dob-month').val().padStart(2, '0') + '-' + $('#dob-day').val().padStart(2, '0')
      var academicYear = window.MTCAdmin.determineAcademicYear()
      var inputDate
      if (/^\d{4}-\d{2}-\d{2}$/.test(composedDate)) {
        inputDate = new Date(Date.UTC(
          parseInt($('#dob-year').val(), 10),
          parseInt($('#dob-month').val(), 10) - 1, // monthIndex
          parseInt($('#dob-day').val(), 10),
          0,
          0,
          0,
          0)
        )
      }
      if (inputDate !== undefined &&
        (!window.MTCAdmin.isWithinAcademicYear(inputDate, academicYear, 8)) &&
        $('#dob-year').val().length === 4) {
        // Show age consent
        $('#js-age-warning').addClass('show-age-content')
        $('#js-age-warning').removeClass('hide-age-content')
      } else if ($('.show-age-content').length > 0) {
        // hide age consent
        $('#js-age-warning').addClass('hide-age-content')
        $('#js-age-warning').removeClass('show-age-content')
      }
    }
  }

  window.MTCAdmin.determineAcademicYear = function () {
    var currentDate = new Date()
    var currentYear = (currentDate).getUTCFullYear()
    var startOfJanuary = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0))
    var endOfAugust = new Date(Date.UTC(currentYear, 7, 31, 23, 59, 59, 0))
    if (currentDate >= startOfJanuary && currentDate <= endOfAugust) {
      return currentYear - 1
    }
    return currentYear
  }

  window.MTCAdmin.isWithinAcademicYear = function (inputDate, academicYear, targetYear) {
    var targetAcademicYear = academicYear - targetYear
    const startDate = new Date(Date.UTC(targetAcademicYear - 1, 8, 2, 0, 0, 0)) // 2 Sep
    const endDate = new Date(Date.UTC(targetAcademicYear, 8, 1, 23, 59, 59)) // 1 Sep
    return inputDate >= startDate && inputDate <= endDate
  }
})()
