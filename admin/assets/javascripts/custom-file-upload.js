/* global $ */
$(function () {
  function customFileUpload (e) {
    var formEl = $('#upload-form')
    var removeEl = $('#removeUploadedFile')

    removeEl.on('click', function (e) {
      removeEl.css('visibility', 'hidden')
    })

    $('input:file').change(function (e) {
      removeEl.css('visibility', 'visible')
      var fileName = $(this).val()
      $('.filename').html(fileName)
    })

    formEl.submit(function () {
      formEl.val('Sending...')
      $(this).attr('disabled', 'disabled')
    })
  }

  if ($('#upload-form-submit').length > 0) {
    customFileUpload()
  }
})
