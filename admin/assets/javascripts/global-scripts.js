/**
 * Global scripts.
 */
/* global $ */
$(function () {
  /**
   * Tick all checkboxes. Common functionality.
   * @param sel
   * @param e
   */
  function tickAllCheckboxes (sel, e) {
    $('#tickAllCheckboxes').on('change', function () {
      $(sel + ' > tbody div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))
      if ($('#selectAll')) {
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

  /**
   * Radio, checkboxes and link interaction for page 'pupils not taking check'.
   * @param sel
   * @param e
   */
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
   * Pupils not taking the check.
   */
  var pupilsNotTakingCheck = function () {
    /**
     * Is radio button checked?
     */
    var isRadioChecked = function () {
      var el = $('input:radio[name="attendanceCode"]:checked')
      if (el.length > 0) {
        $('#stickyConfirm').prop('disabled', false)
      } else {
        $('#stickyConfirm').prop('disabled', true)
      }
    }

    /**
     * Is there at least one checkbox checked?
     */
    var isCheckboxChecked = function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      if (el.length > 0) {
        $('#stickyConfirm').prop('disabled', false)
      } else {
        $('#stickyConfirm').prop('disabled', true)
      }
    }

    /**
     * 'Select all' checkboxes link.
     */
    $('#selectAll').on('click', function (e) {
      $(this).addClass('all-hide')
      $('#unselectAll').removeClass('all-hide')
      $('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
      isRadioChecked()
    })

    /**
     * 'Unselect all' checkboxes link.
     */
    $('#unselectAll').on('click', function (e) {
      $(this).addClass('all-hide')
      $('#selectAll').removeClass('all-hide')
      $('#stickyConfirm').prop('disabled', true)
      $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
    })

    /**
     * Check all checkbox.
     */
    $('#tickAllCheckboxes').on('change', function () {
      if ($(this).is(':checked') === true) {
        $('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
        isRadioChecked()
      } else {
        $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
        $('#stickyConfirm').prop('disabled', true)
      }
    })

    /**
     * Radios buttons.
     */
    $('input:radio[name="attendanceCode"]').on('click', function () {
      $('input:radio[name="attendanceCode"]').attr('data-checked', null)
      if ($('input:radio[name="attendanceCode"]').is(':checked')) {
        $($(this)).attr('data-checked', true)
        isCheckboxChecked()
      }
    })

    /**
     * Checkboxes.
     */
    $('.multiple-choice-mtc > input:checkbox').on('click', function () {
      if ($(this).is(':checked')) {
        $($(this)).attr('data-checked', true)
        isRadioChecked()
      } else {
        $($(this)).attr('data-checked', null)
        isCheckboxChecked()
      }
    })
  }

  pupilsNotTakingCheck()

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

  $('input:file').on('change', function (e) {
    e.stopPropagation()
    $('input:submit').prop('disabled', !$(this).val())
  })
})
