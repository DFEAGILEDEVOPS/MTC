/**
 * Print popup.
 */

/* global $ window screen */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.printPopup = {
    openWindow: function (pinEnv, params) {
      if (params === undefined) params = ''

      var width = screen.width / 2
      var height = screen.height / 2
      var left = (screen.width / 2) - (width / 2)

      window.open(
        '/pupil-pin/print-' + pinEnv + '-pins?' + params,
        'Print preview',
        'left=' + left + ', top=100, width=' + width + ', height=' + height + ', toolbar=0, resizable=0'
      )
    },
    parseParams: function (params) {
      var requestParams = ''
      for (var i = 0; i < params.length; i++) {
        requestParams += params[i].name + '=' + params[i].value + '&'
      }
      return requestParams
    }
  }
})
