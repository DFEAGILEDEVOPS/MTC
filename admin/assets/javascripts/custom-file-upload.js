/**
 * File upload customisation.
 */
/* global $ */
/* eslint-disable no-var */
$(function () {
  'use strict'

  function customFileUpload (e) {
    var $formElement = $('#upload-form')
    var $removeElement = $('#removeUploadedFile')
    var isSubmitted = false

    $removeElement.on('click', function (e) {
      $removeElement.css('visibility', 'hidden')
      $removeElement.hide()
    })

    $('input:file').change(function (e) {
      var hasFileForUpload = !!e.target.value
      if (!hasFileForUpload) {
        return $removeElement.click()
      }
      $removeElement.css('visibility', 'visible')
      $removeElement.show()
      var $fileName = $(this).val()
      $('.filename').html($fileName)
    })

    $formElement.submit(function () {
      if (isSubmitted) {
        return false
      }
      $formElement.val('Sending...')
      isSubmitted = true
      return true
    })
  }

  if ($('#upload-form-submit').length > 0) {
    customFileUpload()
  }
})
