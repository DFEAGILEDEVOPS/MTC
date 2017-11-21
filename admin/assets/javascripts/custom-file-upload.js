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

    $removeElement.on('click', function (e) {
      $removeElement.css('visibility', 'hidden')
      $uploadButton.attr('disabled', 'disabled')
    })

    $('input:file').change(function (e) {
      $removeElement.css('visibility', 'visible')
      $uploadButton.attr('disabled', false)
      var $fileName = $(this).val()
      $('.filename').html($fileName)
    })

    $formElement.submit(function () {
      $formElement.val('Sending...')
      $(this).attr('disabled', 'disabled')
    })
  }

  if ($('#upload-form-submit').length > 0) {
    customFileUpload()
  }
})
