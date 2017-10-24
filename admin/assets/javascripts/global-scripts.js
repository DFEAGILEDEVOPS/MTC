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
   * Pupils not taking the check methods.
   */
  var pupilsNotTakingCheck = function () {
    /**
     * Enable/disable confirmation button from sticky banner.
     * @param status
     */
    var enableButtonStatus = function (status) {
      if (status === true) {
        $('#stickyBanner').addClass('show')
      } else {
        $('#stickyBanner').removeClass('show')
      }
    }

    /**
     * Is radio button checked?
     */
    var isRadioChecked = function () {
      var el = $('input:radio[name="attendanceCode"]:checked')
      if (el.length > 0) {
        enableButtonStatus(true)
      } else {
        enableButtonStatus(false)
      }
    }

    /**
     * Count checkboxes, populate sticky <span>.
     */
    var countCheckboxes = function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      $('#totalPupilsSelected').text(el.length)
    }

    /**
     * Is there at least one checkbox checked?
     */
    var isCheckboxChecked = function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      if (el.length > 0) {
        enableButtonStatus(true)
      } else {
        enableButtonStatus(false)
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
      countCheckboxes()
    })

    /**
     * 'Unselect all' checkboxes link.
     */
    $('#unselectAll').on('click', function (e) {
      $(this).addClass('all-hide')
      $('#selectAll').removeClass('all-hide')
      enableButtonStatus(false)
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
        enableButtonStatus(true)
      }
      countCheckboxes()
    })

    /**
     * Radios buttons.
     */
    $('input:radio[name="attendanceCode"]').on('click', function () {
      $('input:radio[name="attendanceCode"]').attr('data-checked', null)
      if ($('input:radio[name="attendanceCode"]').is(':checked')) {
        $($(this)).attr('data-checked', true)
        isCheckboxChecked()
        countCheckboxes()
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
      countCheckboxes()
    })
  }

  /**
   * 'Generate pins' methods.
   */
  var generatePins = function () {
    $('#generatePins .multiple-choice-mtc > input:checkbox').on('click', function () {
      var el = $('#generatePins .multiple-choice-mtc > input:checkbox:checked')
      if (el.length > 0) {
        $('#stickyBanner').addClass('show')
      } else {
        $('#stickyBanner').removeClass('show')
      }
    })
  }

  /**
   * 'Pupils not taking the check' page.
   */
  if ($('#pupils-not-taking-checks .list.attendance-code-list')) {
    pupilsNotTakingCheck()
  }

  /**
   * 'Generate pins' page,
   */
  if ($('#generatePins')) {
    console.log('GENERATE PINS PAGE')
    generatePins()
  }

  $('input:file').on('change', function (e) {
    e.stopPropagation()
    $('input:submit').prop('disabled', !$(this).val())
  })
})
