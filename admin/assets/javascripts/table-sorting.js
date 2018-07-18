/**
 * Table sorting.
 */

/* global $ */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.tableSort = {

    getCellValue: function (tr, idx) {
      return tr.children[idx].innerText || tr.children[idx].textContent
    },

    comparer: function (idx, asc, config) {
      return function (a, b) {
        return (function (v1, v2) {
          return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)
            ? v1 - v2 : window.GOVUK.tableSort.getStringComparisonResult(v1, v2, asc, config)
        })(window.GOVUK.tableSort.getCellValue(a, idx), window.GOVUK.tableSort.getCellValue(b, idx))
      }
    },

    getStringComparisonResult: function (a, b, isAscending, config) {
      if (this.isNullString(a, config)) {
        return 1
      } else if (this.isNullString(b, config)) {
        return -1
      } else if (a === b) {
        return 0
      } else if (isAscending) {
        return a.toString().localeCompare(b)
      } else if (!isAscending) {
        return b.toString().localeCompare(a)
      }
    },

    isNullString: function (v, config) {
      if (!config.sortNullsLast) {
        return false
      }
      if ((v === undefined || v === null || v === '')) {
        return true
      }
      var hasIgnoredString = config.ignoredStrings.some(function (ignoredString) {
        return ignoredString === v
      })
      if (hasIgnoredString) {
        return true
      }
    },

    applySortClass: function (headerEl) {
      // Remove sort classes from headers
      document.querySelectorAll('thead tr th span').forEach(function (el) {
        el.className = 'sort-icon'
      })
      // Display sorting class based on sorting behavior
      if (headerEl.asc === undefined) {
        headerEl.getElementsByTagName('span')[0].className = 'sort-icon desc'
      } else {
        headerEl.getElementsByTagName('span')[0].className = !headerEl.asc ? 'sort-icon asc' : 'sort-icon desc'
      }
    },

    /**
     * Performs sorting for the supplied table
     * @param {Object} document
     * @param {String} tableId
     * @param {String} config
     */
    applySorting: function (document, tableId, config) {
      // Listen for click events and perform sorting
      document.querySelectorAll('th').forEach(function (th) {
        return th.addEventListener('click', function () {
          window.GOVUK.tableSort.applySortClass(this)
          var tbody = document.querySelector('#' + tableId + ' tbody')
          Array.from(tbody.querySelectorAll('tr'))
            .sort(window.GOVUK.tableSort.comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = this.asc !== undefined ? !this.asc : false, config))
            .forEach(function (tr) {
              return tbody.appendChild(tr)
            })
        })
      })
    }
  }
})
