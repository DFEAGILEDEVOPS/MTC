/**
 * Global scripts.
 */
/* global $ */
$(function () {
  function tickAllCheckboxes (sel, e) {
    $('#tickAllCheckboxes').on('change', function () {
      $(sel + ' > tbody div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))
      if ($('#selectAll')) {
        //console.log('SELECT ALL', $(this).is(':checked'))
        if ($(this).is(':checked') === true) {
          $('#selectAll').addClass('all-hide')
          $('#unselectAll').removeClass('all-hide')
        } else {
          $('#unselectAll').addClass('all-hide')
          $('#selectAll').removeClass('all-hide')
        }
      }
    })
  }

  function disableCheckAll (sel, e) {
    if ($(sel)) {
      var lengthAll = $(sel + ' > tbody div > input:checkbox').length
      var lengthChecked = $(sel + ' > tbody div > input:checkbox:disabled').length

      if (lengthAll === lengthChecked) {
        $('#tickAllCheckboxes').prop('disabled', true)
      } else {
        $('#tickAllCheckboxes').prop('disabled', false)
      }
    }
  }

  if ($('#checkFormsList').length > 0) tickAllCheckboxes('#checkFormsList')
  if ($('#pupilsList').length > 0) tickAllCheckboxes('#pupilsList')
  if ($('#attendanceList').length > 0)tickAllCheckboxes('#attendanceList')

  if ($('#checkFormsList').length > 0) disableCheckAll('#checkFormsList')
  if ($('#pupilsList').length > 0) disableCheckAll('#pupilsList')
  if ($('#attendanceList').length > 0) disableCheckAll('#attendanceList')

  /**
   * 'Select all' / 'Unselect all' checkboxes
   */
  if ($('#selectAll').length > 0) {
    $('#selectAll').on('click', function (e) {
      $(this).addClass('all-hide')
      $('#unselectAll').removeClass('all-hide')
    })

    $('#unselectAll').on('click', function (e) {
      $(this).addClass('all-hide')
      $('#selectAll').removeClass('all-hide')
    })
  }

  /**
   *  Enable/disable 'confirm' button based on custom validation for attendance codes.
   */
  if ($('input:radio[name="attendanceCode"]').length > 0) {
    var radioTicked = 0
    var checkboxTicked = 0

    $('input:radio[name="attendanceCode"]').add('.multiple-choice-mtc > input:checkbox').on('click', function () {
      $('input:radio[name="attendanceCode"]').attr('data-checked', null)

      if ($('input:radio[name="attendanceCode"]').is(':checked')) {
        $($(this)).attr('data-checked', true)
        radioTicked = 1
      }

      if ($('.multiple-choice-mtc > input:checkbox').is(':checked')) {
        $($(this)).attr('data-checked', true)
        checkboxTicked = 1
      }

      if (radioTicked > 0 && checkboxTicked > 0) {
        $('#stickyConfirm').prop('disabled', false)
      } else {
        $('#stickyConfirm').prop('disabled', true)
      }
    })
  }

  /**
   * Sticky confirmation banner.
   */
  if ($('#stickyHeader').length > 0) {
    $(function () {
      // Set the wrapper's height
      $('#stickyHeader').parent().css('min-height', $('#stickyHeader').outerHeight())
    })
    $(window).scroll(function () {
      var sticky = $('#stickyHeader')
      if (sticky.parent().position().top - $(window).scrollTop() < 0) {
        if (!sticky.data('fixed')) {
          sticky.css({
            'position': 'fixed',
            'top': '0',
            'width': sticky.width()
          })
          sticky.data('fixed', true)
        }
      } else if (sticky.data('fixed')) {
        sticky.css({
          'position': 'static',
          'top': 'auto'
        })
        sticky.data('fixed', false)
      }
    })
  }
  
  $('#selectAll').on('click', function (e) {
    $(this).addClass('all-hide')
    $('#unselectAll').removeClass('all-hide')
  })

  $('#unselectAll').on('click', function (e) {
    $(this).addClass('all-hide')
    $('#selectAll').removeClass('all-hide')
  })

  $('input:file').on('change', function (e) {
    e.stopPropagation()
    $('input:submit').prop('disabled', !$(this).val())
  })
})
