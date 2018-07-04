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
    toggleAllCheckboxes: function (sel, validation, param) {
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
            if (param) {
              $('.multiple-choice-mtc > input:checkbox').each(function () {
                checkboxUtil.updateSortingLink('add', param, $(this).val())
              })
            }
          } else {
            deselectAll.addClass('all-hide')
            selectAll.removeClass('all-hide')
            $('.multiple-choice-mtc > input:checkbox').attr('data-checked', null)
            stickyBanner.toggle(false)
            if (param) {
              $('.multiple-choice-mtc > input:checkbox').each(function () {
                checkboxUtil.updateSortingLink('remove', param, $(this).val())
              })
            }
          }
        }
      })
    },

    /**
     * 'Select all' checkbox link.
     * @param sel
     * @param validation
     */
    selectAll: function (sel, validation, param) {
      $('#selectAll').on('click', function (e) {
        var validationStatus
        if (validation) {
          validationStatus = validation()
        }
        $(this).addClass('all-hide')
        $('#deselectAll').removeClass('all-hide')
        $(sel + ' > input:checkbox').attr('data-checked', true)
        stickyBanner.toggle(validationStatus || true)
        if (param) {
          $(sel + ' > input:checkbox').each(function () {
            checkboxUtil.updateSortingLink('add', param, $(this).val())
          })
        }
      })
    },

    /**
     * 'Deselect all' checkbox link.
     * @param sel
     * @param validation
     */
    deselectAll: function (sel, validation, param) {
      $('#deselectAll').on('click', function (e) {
        var validationStatus
        if (validation) {
          validationStatus = validation()
        }
        $(this).addClass('all-hide')
        $('#selectAll').removeClass('all-hide')
        stickyBanner.toggle(validationStatus || false)
        $(sel + ' > input:checkbox').attr('data-checked', null)
        if (param) {
          $(sel + ' > input:checkbox').each(function () {
            checkboxUtil.updateSortingLink('add', param, $(this).val())
          })
        }
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
          if (countCheckedCheckboxes === 0 || countCheckedCheckboxes < countAllCheckboxes) {
            $('#deselectAll').addClass('all-hide')
            $('#selectAll').removeClass('all-hide')
            $('#tickAllCheckboxes').prop('checked', false)
          }
        }
      })
    },

    /**
     * Register the click event to save checkboxes in the `sortingLink`s.
     * @param sel
     * @param param
     */
    saveSelectedForSorting: function (sel, param) {
      $(sel + ' > input:checkbox').on('click', function () {
        if ($(this).val() === 'on') return // for the select/deselect all checkboxes

        if ($(this).is(':checked')) {
          checkboxUtil.updateSortingLink('add', param, $(this).val())
        } else {
          checkboxUtil.updateSortingLink('remove', param, $(this).val())
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
        if ($.trim(e.currentTarget.value).length > 0 && validation()) {
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
      stickyBanner.positioning()
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
    positioning: function () {
      var documentHeight = $(document).height()
      var stickyBanner = $('#stickyBanner')
      var calculatePosition = function () {
        var distance = documentHeight - $(window).height() - $('#footer').outerHeight()
        var y = $(this).scrollTop()
        if (y > distance) {
          stickyBanner.css({ bottom: y - distance })
        } else {
          stickyBanner.css({ bottom: 0 })
        }
      }

      // Initial position.
      calculatePosition()

      // Re-calculate position on scrolling.
      $(document).scroll(function () {
        calculatePosition()
        // if (y > distance) {
        //   stickyBanner.css({ bottom: y - distance })
        // } else {
        //   stickyBanner.css({ bottom: 0 })
        // }
      })

      // Re-calculating position on window resize.
      $(window).resize(function () {
        calculatePosition()
        // if (y > distance) {
        //   stickyBanner.css({ bottom: y - distance })
        // } else {
        //   stickyBanner.css({ bottom: 0 })
        // }
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
   * Util methods to help manage the checkbox state.
   * @type {{checkCheckbox: checkCheckbox, updateSortingLink: updateSortingLink, tableRowVisibility: tableRowVisibility, reselectPreviousValues: reselectPreviousValues, getQueryParam: getQueryParam, addToSortingLink: addToSortingLink, removeFromSortingLink: removeFromSortingLink}}
   */
  var checkboxUtil = {
    /**
     * Change checkbox status to 'checked' for passed `param`Ids.
     * @param `param`Ids
     * @returns {boolean}
     */
    checkCheckbox: function (param, paramIds) {
      if (!paramIds) { return false }
      $('input[name="' + param + '"]').prop('checked', false).attr('data-checked', false)
      $(paramIds).each(function (key, value) {
        $('input[id="' + param + '-' + value + '"]').prop('checked', true).attr('data-checked', true)
      })
    },

    /**
     * Add a parameter to the sorting link
     * @param link
     * @param param
     * @param insertParamId
     */
    addToSortingLink: function (link, param, insertParamId) {
      var paramIndex = link.attr('href').indexOf(param + 'Ids=')
      var paramLength = (param + 'Ids=').length

      if (paramIndex === -1) {
        // param not previously set in the URL, add `param`Ids=
        var precedingElement = link.attr('href').indexOf('?') === -1 ? '?' : '&'
        // if it's the first parameter, add it with ?, otherwise use &
        link.attr('href', link.attr('href') + precedingElement + param + 'Ids=')
        link.attr('href', link.attr('href') + insertParamId)
      } else {
        // add it after `param`Ids=, before the previous first element of `param`Ids
        link.attr(
          'href',
          link.attr('href').slice(0, paramIndex + paramLength) +
            insertParamId +
            link.attr('href').substring(paramIndex + paramLength)
        )
      }
    },

    /**
     * Remove the parameter from the link
     * @param link
     * @param insertParamId
     */
    removeFromSortingLink: function (link, insertParamId) {
      link.attr('href', link.attr('href').replace(insertParamId, ''))
    },

    /**
     * Update sorting link to include active parameters - group / pupil ids.
     * @param action
     * @param groupId
     */
    updateSortingLink: function (action, param, paramId) {
      var sortingLinks = $('.sortingLink')

      sortingLinks.each(function () {
        var sortingLink = $(this)
        var previousParams = checkboxUtil.getQueryParamFromString(sortingLink.attr('href'), param + 'Ids').split(',')
        var insertParamId = paramId + ','

        if (sortingLink.length <= 0) return // defensive programming, don't alter null links

        if (action === 'add' && $.inArray(paramId, previousParams) === -1) checkboxUtil.addToSortingLink(sortingLink, param, insertParamId)
        if (action === 'remove' && $.inArray(paramId, previousParams) !== -1) checkboxUtil.removeFromSortingLink(sortingLink, insertParamId)
      })
    },

    /**
     * Table row visibility for a parameter.
     * @param param
     * @param paramIds
     */
    tableRowVisibility: function (param, paramIds) {
      var sel = '.spacious > tbody > tr'
      if (paramIds.length < 1 || paramIds[0].length < 1) {
        $(sel).removeClass('hidden')
      } else {
        $(sel).addClass('hidden')
        paramIds.map(function (pId) {
          $(sel + '.' + param + '-id-' + pId).removeClass('hidden')
        })
        $(sel + '.hidden .multiple-choice-mtc > input:checkbox:checked').prop('checked', false)
      }
    },

    /**
     * Parses variable from the string provided.
     * @param variable
     */
    parseQueryString: function (query, variable) {
      var vars = query.split('&')
      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (decodeURIComponent(pair[0]) === variable) {
          return decodeURIComponent(pair[1]).replace(/,$/, '')
        }
      }
      return ''
    },

    /**
     * Gets the window query string and parses it.
     * @param variable
     */
    getQueryParam: function (variable) {
      var query = window.location.search.substring(1)
      return checkboxUtil.parseQueryString(query, variable)
    },

    /**
     * Gets the url from a query string and parses it.
     * @param variable
     */
    getQueryParamFromString: function (querystring, variable) {
      var searchIndex = querystring.indexOf('?')
      if (searchIndex === -1) return '' // nothing to be parsed

      return checkboxUtil.parseQueryString(querystring.substring(searchIndex + 1), variable)
    },

    /**
    * Re-doing checked state for checkboxes when sorting
    * @param param
    */
    reselectPreviousValues: function (param, updateCountedCheckboxes) {
      var paramIds = []
      var activeParamIds = checkboxUtil.getQueryParam(param + 'Ids')
      if (activeParamIds) {
        var paramIdsArr = activeParamIds.split(',')
        paramIdsArr.map(function (p) {
          paramIds.push(p)
          checkboxUtil.updateSortingLink('add', param, p)
        })
        checkboxUtil.checkCheckbox(param, paramIdsArr)

        var countCheckedCheckboxes = inputStatus.countCheckedCheckboxes()
        var countAllCheckboxes = inputStatus.countCheckboxes()

        if (updateCountedCheckboxes) {
          if (countCheckedCheckboxes === 0 || countCheckedCheckboxes < countAllCheckboxes) {
            $('#deselectAll').addClass('all-hide')
            $('#selectAll').removeClass('all-hide')
            $('#tickAllCheckboxes').prop('checked', false)
          } else {
            $('#deselectAll').removeClass('all-hide')
            $('#selectAll').addClass('all-hide')
            $('#tickAllCheckboxes').prop('checked', true)
          }
        }
      }
      return paramIds
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
    checkboxUtil.reselectPreviousValues('pupil', true)
    inputStatus.toggleAllCheckboxes('#pupilsList', pupilsNotTakingCheck.validateForm, 'pupil')
    inputStatus.selectAll('.multiple-choice-mtc', false, 'pupil')
    inputStatus.deselectAll('.multiple-choice-mtc', false, 'pupil')
    inputStatus.checkboxStatus('.multiple-choice-mtc', pupilsNotTakingCheck.validateForm)
    inputStatus.radioStatus('attendanceCode', pupilsNotTakingCheck.validateForm)
    inputStatus.saveSelectedForSorting('.multiple-choice-mtc', 'pupil')
  }

  if ($('#pupilsRestartList').length > 0) {
    inputStatus.toggleAllCheckboxes('#pupilsRestartList', restarts.validateForm)
    inputStatus.selectAll('.multiple-choice-mtc')
    inputStatus.deselectAll('.multiple-choice-mtc')
    inputStatus.checkboxStatus('.multiple-choice-mtc', restarts.validateForm)
    inputStatus.radioStatus('restartReason', restarts.validateForm)
  }

  if ($('#generatePins').length > 0) {
    checkboxUtil.reselectPreviousValues('pupil', true)
    inputStatus.toggleAllCheckboxes('#generatePins', false, 'pupil')
    inputStatus.selectAll('.multiple-choice-mtc', false, 'pupil')
    inputStatus.deselectAll('.multiple-choice-mtc', false, 'pupil')
    inputStatus.checkboxStatus('.multiple-choice-mtc', generatePins.isCheckboxChecked)
    inputStatus.saveSelectedForSorting('.multiple-choice-mtc', 'pupil')
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
    var groupIds = checkboxUtil.reselectPreviousValues('group')
    checkboxUtil.tableRowVisibility('group', groupIds)

    $('#filterByGroup input:checkbox').on('click', function (e) {
      if ($(this).is(':checked')) {
        $(this).attr('data-checked', true)
        groupIds.push($(this).val())
        checkboxUtil.updateSortingLink('add', 'group', $(this).val())
      } else {
        $(this).attr('data-checked', false)
        groupIds.splice($.inArray($(this).val(), groupIds), 1)
        checkboxUtil.updateSortingLink('remove', 'group', $(this).val())
      }
      checkboxUtil.tableRowVisibility('group', groupIds)

      /* Sticky banner interaction */
      stickyBanner.outputCheckedCheckboxes(inputStatus.countCheckedCheckboxes())
      stickyBanner.positioning()
      var displayStickyBanner = false
      if ($('#pupils-not-taking-checks').length > 0) {
        displayStickyBanner = pupilsNotTakingCheck.isCheckboxChecked()
      }
      if ($('#pupilsRestartList').length > 0) {
        displayStickyBanner = restarts.validateForm()
      }
      stickyBanner.toggle(displayStickyBanner)
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
