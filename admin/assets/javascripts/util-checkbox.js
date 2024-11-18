/**
 * Utilities for dealing with checkboxes state, counts and the sticky banner associated with them
 *
 * inputStatus, stickyBanner, checkboxUtil are global, to be accessed
 * by scripts in other files that use them.
 */

var inputStatus = {
  /**
    * Check/uncheck all checkboxes (text links)
    * @param sel
    * @param validation
    */
  toggleAllCheckboxes: function (sel, validation) {
    $('#tickAllCheckboxes').on('change', function () {
      var validationStatus = true
      var selectAll = $('#selectAll')
      var deselectAll = $('#deselectAll')

      if (validation) {
        validationStatus = validation()
      }

      $(sel + ' tbody > tr:visible div > input:checkbox').not('[disabled]').prop('checked', ($(this).is(':checked')))

      if (selectAll) {
        if ($(this).is(':checked') === true) {
          selectAll.addClass('all-hide')
          deselectAll.removeClass('all-hide')
          $('.multiple-choice-mtc > input:checkbox').attr('data-checked', true)
          var countCheckedCheckboxes = inputStatus.countCheckedCheckboxes()
          stickyBanner.toggle(validationStatus && countCheckedCheckboxes > 0)
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
    $('#selectAll').on('click', function () {
      var validationStatus
      if (validation) {
        validationStatus = validation()
      }
      $(this).addClass('all-hide')
      $('#deselectAll').removeClass('all-hide')
      $(sel + ' > input:checkbox').attr('data-checked', true)
      var countCheckedCheckboxes = inputStatus.countCheckedCheckboxes()
      // eslint-disable-next-line no-constant-binary-expression
      stickyBanner.toggle((validationStatus || true) && countCheckedCheckboxes > 0)
    })
  },

  /**
    * 'Deselect all' checkbox link.
    * @param sel
    * @param validation
    */
  deselectAll: function (sel, validation) {
    $('#deselectAll').on('click', function () {
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
        if (countCheckedCheckboxes === 0 || countCheckedCheckboxes < countAllCheckboxes) {
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
   * Calculate and update the sticky banner position
   */
  calculatePosition: function () {
    var stickyBannerEl = $('#stickyBanner')
    var footerEl = $('#govuk-footer').length === 0 ? $('#footer') : $('#govuk-footer')
    if (stickyBannerEl.next(footerEl).length === 0) {
      // we're moving the banner outside of the form, so add a click handler
      // to submit it.  The name of the form must be 'stickyBannerForm' so we do not accidentally submit a
      // different form!
      var form = $('form[name="stickyBannerForm"]')
      if (form) {
        $('#stickyConfirm').on('click touchstart', function () {
          // prevent form submission for print pins form
          var printPinsForm = document.getElementById('printPinsForm')
          !printPinsForm && form.submit()
          $(this).attr('disabled', 'disabled')
        })
      }
      // move the sticky banner to be a sibling of content and footer
      // so it can be full width
      stickyBannerEl.insertBefore(footerEl)
    }
    var isIE = (navigator.userAgent.indexOf('MSIE') !== -1) || !!document.documentMode
    if (isIE) {
      // IE doesn't support position: sticky, so toggle fixed class instead
      var scroll = $(document).scrollTop()
      var footerTop = footerEl[0].getBoundingClientRect().top + scroll
      var stickyBannerTop = footerTop - stickyBannerEl.outerHeight()
      var windowBottom = $(window).height() + scroll
      if (windowBottom < stickyBannerTop) {
        stickyBannerEl.addClass('fixed')
      } else {
        stickyBannerEl.removeClass('fixed')
      }
    }
  },

  /**
    * Sticky banner positioning, set the scroll and resize handlers
    */
  positioning: function () {
    // Initial position.
    stickyBanner.calculatePosition()

    // Re-calculate position on scrolling.
    $(document).scroll(function () {
      stickyBanner.calculatePosition()
      // if (y > distance) {
      //   stickyBanner.css({ bottom: y - distance })
      // } else {
      //   stickyBanner.css({ bottom: 0 })
      // }
    })

    // Re-calculating position on window resize.
    $(window).resize(function () {
      stickyBanner.calculatePosition()
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
  * @type {{checkCheckbox: checkCheckbox, tableRowVisibility: tableRowVisibility, getQueryParam: getQueryParam}}
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
    * Table row visibility for a parameter, used for group filters.
    * @param param
    * @param paramIds
    */
  tableRowVisibility: function (param, paramIds) {
    const sel = '.govuk-spacious > tbody > tr'
    if (paramIds.length < 1 || paramIds[0].length < 1) {
      $(sel).removeClass('js-filter-hidden-group')
    } else {
      $(sel).addClass('js-filter-hidden-group')
      paramIds.forEach(function (pId) {
        $(sel + '.' + param + '-id-' + pId).removeClass('js-filter-hidden-group')
        checkboxUtil.unselectUngroupedCheckboxes(pId)
      })
      $(sel + '.hidden .multiple-choice-mtc > input:checkbox:checked').prop('checked', false)
    }
  },

  /**
   * Unselect row checkboxes that do not belong to the relevant group
   * @param paramId
   */
  unselectUngroupedCheckboxes: function (paramId) {
    const tableRows = document.querySelectorAll('.govuk-spacious > tbody > tr')
    for (let i = 0; i < tableRows.length; i++) {
      const rowClasses = [].slice.apply(tableRows[i].classList).join(' ')
      if (rowClasses.indexOf(`group-id-${paramId}`) < 0) {
        const checkBoxEl = tableRows[i].querySelector('td > .multiple-choice-mtc > input[type=checkbox]')
        checkBoxEl.checked = false
      }
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
  getQueryParamFromString: function (queryString, variable) {
    var searchIndex = queryString && queryString.indexOf('?')
    if (!searchIndex || searchIndex === -1) return '' // nothing to be parsed
    return checkboxUtil.parseQueryString(queryString.substring(searchIndex + 1), variable)
  }
}
