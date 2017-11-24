/**
 * Global scripts.
 */
/* global $ */
$(function () {
  var inputStatus = {
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
            stickyBanner.toggle(validationStatus)
          } else {
            deselectAll.addClass('all-hide')
            selectAll.removeClass('all-hide')
            $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
            stickyBanner.toggle(false)
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
        $(this).addClass('all-hide')
        $('#deselectAll').removeClass('all-hide')
        $(sel + ' > input:checkbox').attr('data-checked', true)
        stickyBanner.toggle(validationStatus || true)
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
        $(this).addClass('all-hide')
        $('#selectAll').removeClass('all-hide')
        stickyBanner.toggle(validationStatus || false)
        $(sel + ' > input:checkbox').attr('data-checked', null)
      })
    },
    /**
     * Manage checkboxes and dependencies.
     * @param sel
     * @param validation
     */
    checkboxStatus: function (sel, validation) {
      $(sel + ' > input:checkbox').on('click', function () {
        var validationStatus = true
        if (validation) {
          validationStatus = validation()
        }
        if ($(this).is(':checked')) {
          $($(this)).attr('data-checked', true)
          stickyBanner.toggle(validationStatus)
        } else {
          $($(this)).attr('data-checked', null)
          stickyBanner.toggle(validationStatus)
        }
      })
    },
    /**
     * Manage radio button status and dependencies.
     * @param sel
     * @param validation
     */
    radioStatus: function (sel, validation) {
      $('input:radio[name="' + sel + '"]').on('click', function () {
        var radioEl = $('input:radio[name="' + sel + '"]')
        var validationStatus = false
        if (validation) {
          validationStatus = validation()
        }
        radioEl.attr('data-checked', null)
        if (radioEl.is(':checked')) {
          $($(this)).attr('data-checked', true)
          stickyBanner.toggle(validationStatus)
        }
      })
    }
  }

  /**
   * Enable/disable confirmation button from sticky banner.
   * @type {{toggle: toggle, countCheckboxes: countCheckboxes}}
   */
  var stickyBanner = {
    /**
     * @param status
     */
    toggle: function (status) {
      if (status === true) {
        stickyBanner.countCheckboxes()
        $('#stickyBanner').addClass('show')
      } else {
        $('#stickyBanner').removeClass('show')
      }
    },
    /**
     * @param checkboxParent
     */
    countCheckboxes: function (checkboxParent) {
      var el = $((checkboxParent || '.multiple-choice-mtc') + ' > input:checkbox:checked')
      $('#totalPupilsSelected').text(el.length)
    }
  }

  /**
   * Methods for 'pupils not taking the check'.
   * @type {{isRadioChecked: isRadioChecked, isCheckboxChecked: isCheckboxChecked, validateForm: validateForm}}
   */
  var pupilsNotTakingCheck = {
    /**
     * Is radio button checked?
     * @returns {boolean}
     */
    isRadioChecked: function () {
      var el = $('input:radio[name="attendanceCode"]:checked')
      return el.length > 0
    },
    /**
     * Is there at least one checkbox checked?
     * @returns {boolean}
     */
    isCheckboxChecked: function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      return el.length > 0
    },
    validateForm: function () {
      return pupilsNotTakingCheck.isRadioChecked() && pupilsNotTakingCheck.isCheckboxChecked()
    }
  }

  /**
   * Methods for 'Generate PINs'.
   * @type {{isCheckboxChecked: isCheckboxChecked}}
   */
  var generatePins = {
    isCheckboxChecked: function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      return el.length > 0
    }
  }

  /**
   * Methods for 'Restarts'.
   * @type {{isRadioChecked: isRadioChecked, isCheckboxChecked: isCheckboxChecked, validateForm: validateForm}}
   */
  var restarts = {
    /**
     * Is radio button checked?
     * @returns {boolean}
     */
    isRadioChecked: function () {
      var el = $('input:radio[name="restartReason"]:checked')
      return el.length > 0
    },
    /**
     * Is there at least one checkbox checked?
     * @returns {boolean}
     */
    isCheckboxChecked: function () {
      var el = $('.multiple-choice-mtc > input:checkbox:checked')
      return el.length > 0
    },
    validateForm: function () {
      return restarts.isRadioChecked() && restarts.isCheckboxChecked()
    }
  }

  /**
   * Page based implementations.
   */
  // @TODO: check forms are to be refactored next.
  // if ($('#checkFormsList').length > 0) inputStatus.toggleAllCheckboxes('#checkFormsList')

  // @TODO: No sticky on this page. Feature needs further work and will change radically.
  if ($('#attendanceList').length > 0) {
    inputStatus.toggleAllCheckboxes('#attendanceList')
    inputStatus.selectAll('.multiple-choice')
    inputStatus.deselectAll('.multiple-choice')
    inputStatus.checkboxStatus('.multiple-choice', generatePins.isCheckboxChecked)
  }

  if ($('#pupilsList').length > 0) {
    inputStatus.toggleAllCheckboxes('#pupilsList', pupilsNotTakingCheck.validateForm)
    inputStatus.toggleAllCheckboxes('#pupilsList', restarts.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', pupilsNotTakingCheck.validateForm)
    inputStatus.checkboxStatus('.multiple-choice-mtc', restarts.validateForm)
    inputStatus.radioStatus('attendanceCode', pupilsNotTakingCheck.validateForm)
    inputStatus.radioStatus('restartReason', restarts.validateForm)
  }

  if ($('#generatePins').length > 0) {
    inputStatus.toggleAllCheckboxes('#generatePins')
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', generatePins.isCheckboxChecked)
  }
})
