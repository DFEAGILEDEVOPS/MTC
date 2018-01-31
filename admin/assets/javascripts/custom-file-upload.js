/**
 * File upload customisation.
 */
/* global $ */
$(function () {
  'use strict'

  function customFileUpload (e) {
    var $formElement = $('#upload-form')
    var $removeElement = $('#removeUploadedFile')
    var $uploadButton = $('#upload-form-submit')
    var isSubmitted = false

    $removeElement.on('click', function (e) {
      $removeElement.css('visibility', 'hidden')
      $removeElement.hide()
      $uploadButton.attr('disabled', 'disabled')
    })

    $('input:file').change(function (e) {
      $removeElement.css('visibility', 'visible')
      $removeElement.show()
      $uploadButton.attr('disabled', false)
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
