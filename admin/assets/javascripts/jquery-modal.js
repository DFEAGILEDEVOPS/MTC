/**
 * MTC implementation of modal dialog box.
 * Based on guidelines found here:
 * https://paper.dropbox.com/doc/Modal-dialog-boxes-jbsTPoITg37IIc6ybjetM
 */
/* global $ */
$(function () {
  function startModal (e) {
    $('.modal-link').on('click', function (e) {
      $('#js-modal-confirmation-button').attr('href', $(this)[0].href)
      toggleShowHideModal(e)
    })
    $('#js-modal-cancel-button').on('click', function (e) {
      toggleShowHideModal(e)
      $('#js-modal-confirmation-button').attr('href', '')
    })
    $('#js-modal-overlay').on('click', function (e) {
      toggleShowHideModal(e)
    })
    $('body').on('keydown', function (e) {
      var modalBox = $('#js-modal-box')
      // escape keystroke should hide the modal when it is visible
      if (e.keyCode === 27 && modalBox.hasClass('show')) {
        toggleShowHideModal(e)
      }
      // space or enter
      if (e.keyCode === 13 || e.keyCode === 32) {
        confirmModal(e, e.target.href)
      }
      // tab or maj+tab, left arrow, right arrow
      if ((e.keyCode === 9 || e.keyCode === 37 || e.keyCode === 39) && modalBox.hasClass('show')) {
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
    toggleShowHideModal(e)
    window.location.replace(e.target.href)
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

  if ($('#js-modal-box').length > 0) {
    startModal()
  }
})
