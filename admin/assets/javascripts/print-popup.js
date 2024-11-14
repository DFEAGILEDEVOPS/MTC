/**
 * Print popup.
 */
/* eslint-disable no-var */
/* global $ */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.printPopup = {
    hideUncheckedPupils: function (printContainer) {
      $(printContainer + ' tr').each(function () {
        $(this).addClass('hidden')
      })
      $('.multiple-choice-mtc > input:checkbox').each(function () {
        var pupilId = $(this).val()
        if ($(this).is(':checked')) {
          $(printContainer + ' tr.pupil-' + pupilId).removeClass('hidden')
        }
      })
    }
  }
})
