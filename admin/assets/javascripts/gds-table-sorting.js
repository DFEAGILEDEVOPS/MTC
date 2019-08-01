/**
 * Table sorting.
 */

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

/* global */
(function () {
  'use strict'
  window.MTCAdmin.tableSort = {

    getCellValue: function (tr, idx) {
      return tr.children[idx].innerText || tr.children[idx].textContent
    },

    comparer: function (idx, asc, config) {
      return function (a, b) {
        return (function (v1, v2) {
          return window.MTCAdmin.tableSort.isNumericValue(v1) && window.MTCAdmin.tableSort.isNumericValue(v2)
            ? window.MTCAdmin.tableSort.getNumberComparisonResult(v1, v2, asc) : window.MTCAdmin.tableSort.getStringComparisonResult(v1, v2, asc, config)
        })(window.MTCAdmin.tableSort.getCellValue(a, idx), window.MTCAdmin.tableSort.getCellValue(b, idx))
      }
    },

    isNumericValue: function (v) {
      var numericOnlyPattern = /^\d+$/
      var numericOnlyRegExp = new RegExp(numericOnlyPattern)
      return ((typeof v === 'string' && numericOnlyRegExp.test(v)) || typeof v === 'number')
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

    getNumberComparisonResult: function (a, b, isAscending) {
      return isAscending ? a - b : b - a
    },

    isNullString: function (v, config) {
      if (!config.sortNullsLast) {
        return false
      }
      if ((v === undefined || v === null || v === '')) {
        return true
      }
      return config.ignoredStrings.some(function (ignoredString) {
        return ignoredString === v
      })
    },

    applySortClass: function (headerEl) {
      // Remove sort classes from headers
      var nodeList = document.querySelectorAll('thead tr th span')
      for (var i = 0; i < nodeList.length; i++) {
        nodeList[i].className = 'sort-icon'
      }

      // Display sorting class based on sorting behavior
      if (headerEl.asc === undefined) {
        headerEl.getElementsByTagName('span')[0].className = 'sort-icon desc'
      } else {
        headerEl.getElementsByTagName('span')[0].className = !headerEl.asc ? 'sort-icon asc' : 'sort-icon desc'
      }
    },

    /**
     * Setup sorting for the supplied table
     * @param {Object} document
     * @param {String} tableId
     * @param {String} config
     */
    applySorting: function (document, tableId, config) {
      // Listen for click events and perform sorting
      var thNodeList = document.querySelectorAll('th')

      for (var i = 0; i < thNodeList.length; i++) {
        var th = thNodeList[i]
        window.MTCAdmin.tableSort.setUpClickHandler(th, i, tableId, config)
      }
    },

    setUpClickHandler: function (th, i, tableId, config) {
      th.addEventListener('click', function () {
        window.MTCAdmin.tableSort.applySortClass(this)
        var tbody = document.querySelector('#' + tableId + ' tbody')
        var trNodeList = tbody.querySelectorAll('tr')
        var trList = [].slice.call(trNodeList)

        trList.sort(window.MTCAdmin.tableSort.comparer(
          i,
          this.asc = this.asc !== undefined ? !this.asc : false,
          config)
        )
          .forEach(function (tr) {
            return tbody.appendChild(tr)
          })
      })
    }
  }
})()
