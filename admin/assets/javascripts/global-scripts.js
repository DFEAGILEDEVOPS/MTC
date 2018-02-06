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

        $(sel + ' tbody > tr:not(.hidden) div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))

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
        var countCheckedCheckboxes = inputStatus.countCheckedCheckboxes()
        var countAllCheckboxes = inputStatus.countCheckboxes()

        if (validation) {
          validationStatus = validation()
        }
        if ($(this).is(':checked')) {
          $($(this)).attr('data-checked', true)
          stickyBanner.toggle(validationStatus)
          if (countCheckedCheckboxes === countAllCheckboxes) {
            $('#deselectAll').removeClass('all-hide')
            $('#selectAll').addClass('all-hide')
            $('#tickAllCheckboxes').prop('checked', true)
          }
        } else {
          $($(this)).attr('data-checked', null)
          stickyBanner.toggle(validationStatus && countCheckedCheckboxes > 0)
          if (countCheckedCheckboxes === 0) {
            $('#deselectAll').addClass('all-hide')
            $('#selectAll').removeClass('all-hide')
            $('#tickAllCheckboxes').prop('checked', false)
          }
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
    },

    /**
     * Detect if textbox has changed.
     * @param sel
     * @param validation
     * @returns {boolean}
     */
    textFieldStatus: function (sel, validation) {
      if (!sel) { return false }
      $(sel).on('change keyup', function (e) {
        if (e.currentTarget.value.trim().length > 0 && validation()) {
          stickyBanner.toggle(true)
        } else {
          stickyBanner.toggle(false)
        }
      })
    },

    /**
     * @param checkboxParent
     */
    countCheckedCheckboxes: function (checkboxParent) {
      var el = $((checkboxParent || '.multiple-choice-mtc') + ' > input:checkbox:checked').not('#tickAllCheckboxes')
      return el.length || 0
    },

    /**
     * @param checkboxParent
     */
    countCheckboxes: function (checkboxParent) {
      var el = $((checkboxParent || '.multiple-choice-mtc') + ' > input:checkbox').not('#tickAllCheckboxes')
      return el.length
    }
  }

  /**
   * Enable/disable confirmation button from sticky banner.
   * @type {{toggle: toggle}}
   */
  var stickyBanner = {
    /**
     * @param status
     */
    toggle: function (status) {
      stickyBanner.stickyBannerPositioning()
      if (status === false) {
        $('#stickyBanner').removeClass('show')
      } else {
        stickyBanner.outputCheckedCheckboxes(inputStatus.countCheckedCheckboxes())
        $('#stickyBanner').addClass('show')
      }
    },

    /**
     * Sticky banner positioning.
     */
    stickyBannerPositioning: function () {
      var windowHeight = $(window).height()
      var documentHeight = $(document).height()
      var footerHeight = $('#footer').height()
      var distance = documentHeight - windowHeight - footerHeight - 10
      var stickyBanner = $('#stickyBanner')

      $(document).scroll(function () {
        var y = $(this).scrollTop()
        if (y > distance) {
          stickyBanner.css({ bottom: y - distance })
        } else {
          stickyBanner.css({ bottom: 0 })
        }
      })
    },

    /**
     * @param totalCount
     */
    outputCheckedCheckboxes: function (totalCount) {
      $('#totalPupilsSelected').text(totalCount)
    }
  }

  /**
   * Group filters methods.
   * @type {{tableRowVisibility: tableRowVisibility, findActiveGroups: findActiveGroups, checkGroupCheckbox: checkGroupCheckbox, updateSortingLink: updateSortingLink}}
   */
  var groupFilters = {
    /**
     * Table row visibility.
     * @param groupIds
     */
    tableRowVisibility: function (groupIds) {
      var sel = '.spacious > tbody > tr'
      if (groupIds.length < 1 || groupIds[0].length < 1) {
        $(sel).removeClass('hidden')
      } else {
        $(sel).addClass('hidden')
        groupIds.map(function (gId) {
          $(sel + '.group-id-' + gId).removeClass('hidden')
        })
        $(sel + '.hidden .multiple-choice-mtc > input:checkbox:checked').prop('checked', false)
      }
    },

    /**
     * Find active groups from URL.
     * @returns {string}
     */
    findActiveGroups: function () {
      var url = window.location.href
      if (url.lastIndexOf('/groupIds=') > 0) {
        return url.substr(url.lastIndexOf('/groupIds=') + 10, url.length)
      }
    },

    /**
     * Change checkbox status to 'checked' for passed groupIds.
     * @param groupIds
     * @returns {boolean}
     */
    checkGroupCheckbox: function (groupIds) {
      if (!groupIds) { return false }
      $('input[name="group"]').prop('checked', false).attr('data-checked', false)
      $(groupIds).each(function (key, value) {
        $('input[id="group-' + value + '"]').prop('checked', true).attr('data-checked', true)
      })
    },

    /**
     * Update sorting link to include active group ids.
     * @param action
     * @param groupId
     */
    updateSortingLink: function (action, groupId) {
      var sortingLink = $('#sortingLink')
      var insertGroupId = groupId + ','
      if (sortingLink.length > 0) {
        if (action === 'add') {
          if (sortingLink.attr('href').indexOf('groupIds=') === -1) {
            sortingLink.attr('href', sortingLink.attr('href') + 'groupIds=')
          }
          sortingLink.attr('href', sortingLink.attr('href') + insertGroupId)
        } else if (action === 'remove') {
          sortingLink.attr('href', sortingLink.attr('href').replace(insertGroupId, ''))
        }
      }
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
      var elName = $('input#name').val()
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
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
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
    inputStatus.toggleAllCheckboxes('#generatePins')
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
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

  /**
   * Filtering pupils by group.
   */
  if ($('#filterByGroup').length > 0) {
    var groupIds = []
    var activeGroupsIds = groupFilters.findActiveGroups()

    if (activeGroupsIds) {
      $('#filter-content').removeClass('hidden')
      var groupIdsArr = decodeURIComponent(activeGroupsIds).split(',')
      groupIdsArr.map(function (g) {
        groupIds.push(g)
      })
      groupFilters.checkGroupCheckbox(groupIdsArr)
      groupFilters.tableRowVisibility(groupIdsArr)
    }

    $('#filterByGroup input:checkbox').on('click', function (e) {
      if ($(this).is(':checked')) {
        $(this).attr('data-checked', true)
        groupIds.push($(this).val())
        groupFilters.updateSortingLink('add', $(this).val())
      } else {
        $(this).attr('data-checked', false)
        groupIds.splice($.inArray($(this).val(), groupIds), 1)
        groupFilters.updateSortingLink('remove', $(this).val())
      }
      groupFilters.tableRowVisibility(groupIds)
      stickyBanner.outputCheckedCheckboxes(inputStatus.countCheckedCheckboxes())
      stickyBanner.stickyBannerPositioning()
    })

    $('.filter-header').on('click', function (e) {
      $('.filter-label').toggleClass('active')
      $('#filter-content').toggleClass('hidden')
    })

    $('.group-count').each(function () {
      var totalPupils = $('.' + $(this).context.id).length
      $('#' + $(this).context.id).text('(' + totalPupils + ' pupil' + (totalPupils > 1 ? 's' : '') + ')')
    })
  }
})
