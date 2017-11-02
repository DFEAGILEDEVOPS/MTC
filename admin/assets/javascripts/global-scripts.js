/**
 * Global scripts.
 */
/* global $ */
$(function () {
  /**
   * Select / Deselect links and checkbox.
   * @type {{toggleAllCheckboxes: toggleAllCheckboxes, selectAll: selectAll, deselectAll: deselectAll}}
   */
  var selectStatus = {
    /**
     * Check/uncheck all checkboxes (text links)
     * @param sel
     * @param validation
     */
    toggleAllCheckboxes: function (sel, validation) {
      $('#tickAllCheckboxes').on('change', function (e) {
        var validationStatus = true
        var selectAll = $('#selectAll')
        var deselectAll = $('#deselectAll')

        if (validation) {
          validationStatus = validation()
        }

        $(sel + ' > tbody div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))

        if (selectAll) {
          if ($(this).is(':checked') === true) {
            selectAll.addClass('all-hide')
            deselectAll.removeClass('all-hide')
            $('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
            toggleStickyBanner(validationStatus)
          } else {
            deselectAll.addClass('all-hide')
            selectAll.removeClass('all-hide')
            $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
            toggleStickyBanner(false)
          }
        }
      })
    },
    /**
     * 'Select all' checkbox link.
     * @param sel
     * @param validation
     */
    selectAll: function (sel, validation) {
      $('#selectAll').on('click', function (e) {
        var validationStatus
        if (validation) {
          validationStatus = validation()
        }
        console.log('SELECT ALL')
        $(this).addClass('all-hide')
        $('#deselectAll').removeClass('all-hide')
        $(sel + ' > input:checkbox').attr('data-checked', true)
        toggleStickyBanner(validationStatus || true)
      })
    },
    /**
     * 'Deselect all' checkbox link.
     * @param sel
     * @param validation
     */
    deselectAll: function (sel, validation) {
      $('#deselectAll').on('click', function (e) {
        var validationStatus
        if (validation) {
          validationStatus = validation()
        }
        console.log('DESELECT ALL')
        $(this).addClass('all-hide')
        $('#selectAll').removeClass('all-hide')
        toggleStickyBanner(validationStatus || false)
        $(sel + ' > input:checkbox').attr('data-checked', null)
      })
    },
    checkboxStatus: function (sel, validation) {
      console.log('CHECKBOX')
      $(sel + ' > input:checkbox').on('click', function () {
        console.log('CHECKBOX TICKED')
        var validationStatus = true
        if (validation) {
          validationStatus = validation()
        }
        if ($(this).is(':checked')) {
          $($(this)).attr('data-checked', true)
          toggleStickyBanner(validationStatus)
        } else {
          $($(this)).attr('data-checked', null)
          toggleStickyBanner(validationStatus)
        }
        //countCheckboxes()
      })
    }
  }

  /**
   * Enable/disable confirmation button from sticky banner.
   * @param status
   */
  var toggleStickyBanner = function (status) {
    console.log('STICKY BANNER STATUS', status)
    if (status === true) {
      $('#stickyBanner').addClass('show')
    } else {
      $('#stickyBanner').removeClass('show')
    }
  }

  /**
   * Count checkboxes, populate sticky <span>.
   */
  // var countCheckboxes = function () {
  //   var el = $('.multiple-choice-mtc > input:checkbox:checked')
  //   $('#totalPupilsSelected').text(el.length)
  // }

  /**
   * Pupils not taking the check methods.
   */
  var pupilsNotTakingCheck = {
    /**
     * Is radio button checked?
     */
    isRadioChecked: function () {
      var el = $('input:radio[name="attendanceCode"]:checked')
      return (el.length > 0)
    },
    /**
     * Is there at least one checkbox checked?
     */
    isCheckboxChecked: function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      return (el.length > 0)
    },
    validateForm: function () {
      return (pupilsNotTakingCheck.isRadioChecked() && pupilsNotTakingCheck.isCheckboxChecked())
    }

    /**
     * 'Select all' checkboxes link.
     */
    // $('#selectAll').on('click', function (e) {
    //   console.log('SELECT ALL')
    //   $(this).addClass('all-hide')
    //   $('#deselectAll').removeClass('all-hide')
    //   $('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
    //   isRadioChecked()
    //   countCheckboxes()
    //   toggleStickyBanner(true)
    // })

    /**
     * 'Deselect all' checkboxes link.
     */
    // $('#deselectAll').on('click', function (e) {
    //   console.log('DESELECT ALL')
    //   $(this).addClass('all-hide')
    //   $('#selectAll').removeClass('all-hide')
    //   toggleStickyBanner(false)
    //   $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
    // })

    /**
     * Check all checkbox.
     */
    // $('#tickAllCheckboxes').on('change', function () {
    //   if ($(this).is(':checked') === true) {
    //     //$('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
    //     isRadioChecked()
    //   } else {
    //     //$('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
    //     toggleStickyBanner(false)
    //   }
    //   countCheckboxes()
    // })

    /**
     * Radios buttons.
     */
    // $('input:radio[name="attendanceCode"]').on('click', function () {
    //   $('input:radio[name="attendanceCode"]').attr('data-checked', null)
    //   if ($('input:radio[name="attendanceCode"]').is(':checked')) {
    //     $($(this)).attr('data-checked', true)
    //     isCheckboxChecked()
    //     countCheckboxes()
    //   }
    // })

    /**
     * Checkboxes.
     */
    // $('.multiple-choice-mtc > input:checkbox').on('click', function () {
    //   if ($(this).is(':checked')) {
    //     $($(this)).attr('data-checked', true)
    //     isRadioChecked()
    //   } else {
    //     $($(this)).attr('data-checked', null)
    //     isCheckboxChecked()
    //   }
    //   countCheckboxes()
    // })
  }

  /**
   * Pupils not taking the check methods.
   */
  var generatePins = {
    /**
     * Is there at least one checkbox checked?
     */
    isCheckboxChecked: function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      return (el.length > 0)
    }
  }

  /**
   * Page based implementations.
   */
  if ($('#checkFormsList').length > 0) selectStatus.toggleAllCheckboxes('#checkFormsList')
  if ($('#attendanceList').length > 0) selectStatus.toggleAllCheckboxes('#attendanceList')

  if ($('#pupilsList').length > 0) {
    selectStatus.toggleAllCheckboxes('#pupilsList', pupilsNotTakingCheck.validateForm)
    selectStatus.selectAll('.multiple-choice-mtc')
    selectStatus.deselectAll('.multiple-choice-mtc')
    selectStatus.checkboxStatus('.multiple-choice-mtc', pupilsNotTakingCheck.validateForm)
  }

  if ($('#generatePins').length > 0) {
    selectStatus.toggleAllCheckboxes('#generatePins')
    selectStatus.selectAll('.multiple-choice-mtc')
    selectStatus.deselectAll('.multiple-choice-mtc')
    selectStatus.checkboxStatus('.multiple-choice-mtc', generatePins.isCheckboxChecked)
  }

  $('input:file').on('change', function (e) {
    e.stopPropagation()
    $('input:submit').prop('disabled', !$(this).val())
  })
})
