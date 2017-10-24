/**
 * MTC implementation of modal dialog box.
 * Based on guidelines found here:
 * https://paper.dropbox.com/doc/Modal-dialog-boxes-jbsTPoITg37IIc6ybjetM
 */
/* global $ */
$(function () {
  function startModal (e) {
    $('#js-modal-link').add('#js-modal-cancel-button').on('click', function (e) {
      toggleShowHideModal(e)
    })
    $('#js-modal-overlay').on('click', function (e) {
      toggleShowHideModal(e)
    })
    $('body').on('keydown', function (e) {
      // esc
      if (e.keyCode === 27) {
        toggleShowHideModal(e)
      }
      // space or enter
      if (e.keyCode === 13 || e.keyCode === 32) {
        confirmModal(e)
      }
      // tab or maj+tab
      if (e.keyCode === 9 && $('#js-modal-box').hasClass('show')) {
        toggleOnModal(e)
        e.preventDefault(e)
      }
    })
  }

  function toggleOnModal (e) {
    if (e.target.id === 'js-modal-cancel-button') {
      $('#js-modal-confirmation-button').focus().select()
    } else {
      $('#js-modal-cancel-button').focus().select()
    }
  }

  function confirmModal (e) {
    console.log('CONFIRM')
    toggleShowHideModal(e)
  }

  function toggleShowHideModal (e) {
    e.preventDefault()
    $('#js-modal-overlay').toggleClass('show')
    var modalBox = $('#js-modal-box')
    if (modalBox.hasClass('show')) {
      modalBox.removeClass('show')
      $('#js-modal-link').focus()
    } else {
      modalBox.addClass('show')
      $('#js-modal-cancel-button').focus()
    }
  }

  if ($('#js-modal-link') && $('#js-modal-box')) {
    startModal()
  }
})
