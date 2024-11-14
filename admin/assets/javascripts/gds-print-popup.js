'use strict'
/* eslint-disable no-var */
/**
 * Print popup.
 */
if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

(function () {
  window.MTCAdmin.printPopup = {
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
})()
