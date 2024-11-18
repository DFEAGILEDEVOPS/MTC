/**
 * Global scripts.
 *
 * pupilGroups, assignForm, restarts, generatePins, pupilsNotTakingCheck
 * are global, to be accessed by scripts in other files that use them.
 */
/* global inputStatus, stickyBanner */

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
    var elCheckboxes = $('.multiple-choice-mtc > input:checkbox:checked').not('#tickAllCheckboxes')
    var elTickAll = $('.multiple-choice-mtc > input#tickAllCheckboxes:checkbox:checked')
    return elTickAll.length > 0 || elCheckboxes.length > 0
  },
  /**
    * Validation rules.
    * @returns {*}
    */
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
    var el = $('.multiple-choice-mtc > input:checkbox:checked').not('#tickAllCheckboxes')
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
  * Methods for 'assign check form to check windows'.
  * @type {{isCheckboxChecked: isCheckboxChecked}}
  */
var assignForm = {
  /**
    * Is there at least one checkbox checked?
    * @returns {boolean}
    */
  isCheckboxChecked: function () {
    var el = $('.multiple-choice-mtc > input:checkbox:checked')
    return el.length > 0
  },
  /**
    * Validation rules.
    * @returns {*}
    */
  validateForm: function () {
    return assignForm.isCheckboxChecked()
  }
}

/**
  * Methods for 'pupils groups'.
  * @type {{isCheckboxChecked: isCheckboxChecked, isGroupNameComplete: *}}
  */
var pupilGroups = {
  /**
    * Is there at least one checkbox checked?
    * @returns {boolean}
    */
  isCheckboxChecked: function () {
    var elCheckboxes = $('.multiple-choice-mtc > input:checkbox:checked')
    return elCheckboxes.length > 0
  },
  /**
    * Check if name field is not empty.
    * @returns {boolean}
    */
  isGroupNameComplete: function () {
    var elName = $.trim($('input#name').val())
    return elName.length > 0
  },
  /**
    * Validation rules.
    * @returns {*}
    */
  validateForm: function () {
    return pupilGroups.isCheckboxChecked() && pupilGroups.isGroupNameComplete()
  }
}

$(function () {
  /**
   * Page based implementations.
   */
  if ($('#attendanceList').length > 0) {
    inputStatus.toggleAllCheckboxes('#attendanceList')
    inputStatus.selectAll('.multiple-choice')
    inputStatus.deselectAll('.multiple-choice')
    inputStatus.checkboxStatus('.multiple-choice', generatePins.isCheckboxChecked)
  }

  if ($('#pupilsList').length > 0) {
    inputStatus.toggleAllCheckboxes('#pupilsList', pupilsNotTakingCheck.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc', false)
    inputStatus.deselectAll('.multiple-choice-mtc', false)
    inputStatus.checkboxStatus('.multiple-choice-mtc', pupilsNotTakingCheck.validateForm)
    inputStatus.radioStatus('attendanceCode', pupilsNotTakingCheck.validateForm)
  }

  if ($('#pupilsRestartList').length > 0) {
    inputStatus.toggleAllCheckboxes('#pupilsRestartList', restarts.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', restarts.validateForm)
    inputStatus.radioStatus('restartReason', restarts.validateForm)
  }

  if ($('#generatePins').length > 0) {
    inputStatus.toggleAllCheckboxes('#generatePins', false)
    inputStatus.selectAll('.multiple-choice-mtc', false)
    inputStatus.deselectAll('.multiple-choice-mtc', false)
    inputStatus.checkboxStatus('.multiple-choice-mtc', generatePins.isCheckboxChecked)
  }

  if ($('#assignFormToWindowList').length > 0) {
    inputStatus.toggleAllCheckboxes('#assignFormToWindowList', assignForm.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', assignForm.validateForm)
  }

  if ($('#groupPupil').length > 0) {
    inputStatus.toggleAllCheckboxes('#groupPupil', pupilGroups.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', pupilGroups.validateForm)
    inputStatus.textFieldStatus('input#name', pupilGroups.validateForm)
    if (pupilGroups.validateForm()) {
      stickyBanner.toggle(true)
    }
  }

  $(window).resize(function () {
    if (stickyBanner) {
      // this will handle the sticky banner position being wrong if the browser is zoomed in/out
      stickyBanner.positioning()
    }
  })
})
