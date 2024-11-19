/**
 * File upload customisation.
 */

$(function () {
  'use strict'

  function customFileUpload () {
    const $formElement = $('#upload-form')
    const $removeElement = $('#removeUploadedFile')
    let isSubmitted = false

    $removeElement.on('click', function () {
      $removeElement.css('visibility', 'hidden')
      $removeElement.hide()
    })

    $('input:file').change(function (e) {
      const hasFileForUpload = !!e.target.value
      if (!hasFileForUpload) {
        return $removeElement.click()
      }
      $removeElement.css('visibility', 'visible')
      $removeElement.show()
      const $fileName = $(this).val()
      $('.filename').html($fileName)
    })

    $formElement.submit(function () {
      if (isSubmitted) {
        return false
      }
      // Update the form submit button to say it's uploading
      const submitButton = $('#upload-form-submit')
      if (submitButton.text) {
        $('#upload-form-submit').text('Sending...')
      } else if (submitButton.val) {
        $formElement.val('Sending...')
      }
      isSubmitted = true
      return true
    })
  }

  if ($('#upload-form-submit').length > 0) {
    customFileUpload()
  }
})
