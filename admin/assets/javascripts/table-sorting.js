/**
 * Table sorting.
 */

/* global $ */
$(function () {
  'use strict'

  window.GOVUK.tableSort = {

    /**
     * Performs sorting for the supplied table
     * @param {Object} document
     * @param {String} tableId
     * @param {config} tableId
     */
    applySorting: function (document, tableId, config) {
      var getCellValue = function (tr, idx) {
        return tr.children[idx].innerText || tr.children[idx].textContent
      }

      var comparer = function (idx, asc) {
        return function (a, b) {
          return (function (v1, v2) {
            return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2)
              ? v1 - v2 : getStringComparisonResult(v1, v2, asc)
          })(getCellValue(a, idx), getCellValue(b, idx))
        }
      }

      var getStringComparisonResult = function (a, b, isAscending) {
        if (isNullString(a)) {
          return 1
        } else if (isNullString(b)) {
          return -1
        } else if (a === b) {
          return 0
        } else if (isAscending) {
          return a.toString().localeCompare(b)
        } else if (!isAscending) {
          return b.toString().localeCompare(a)
        }
      }

      var isNullString = function (v) {
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
      }

      var applySortClass = function (headerEl) {
        // Remove sort classes from headers
        document.querySelectorAll('thead tr th span').forEach(function (el) {
          el.className = 'sort-icon'
        })
        // Displa y sorting class based on sorting behavior
        if (headerEl.asc === undefined) {
          headerEl.getElementsByTagName('span')[0].className = 'sort-icon desc'
        } else {
          headerEl.getElementsByTagName('span')[0].className = !headerEl.asc ? 'sort-icon asc' : 'sort-icon desc'
        }
      }
      // Listen for click events and perform sorting
      document.querySelectorAll('th').forEach(function (th) {
        return th.addEventListener('click', function () {
          applySortClass(this)
          var tbody = document.querySelector('#' + tableId + ' tbody')
          Array.from(tbody.querySelectorAll('tr'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = this.asc !== undefined ? !this.asc : false))
            .forEach(function (tr) {
              return tbody.appendChild(tr)
            })
        })
      })
    }
  }
})
