/**
 * Table sorting.
 */
/* global $ */
$(function () {
  'use strict'

  // Pupil register sorting
  var isRegisterPupilsView = document.body.contains(document.getElementById('register-pupils'))
  if (isRegisterPupilsView) {
    var getCellValue = function (tr, idx) {
      return tr.children[idx].innerText || tr.children[idx].textContent
    }

    var comparer = function (idx, asc) {
      return function (a, b) {
        return (function (v1, v2) {
          return v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        })(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx))
      }
    }

    var applySortClass = function (headerEl) {
      // Remove sort classes from headers
      document.querySelectorAll('thead tr th span').forEach(function (el) {
        el.className = ''
      })
      // Display sorting class based on sorting behavior
      if (headerEl.asc === undefined) {
        headerEl.getElementsByTagName('span')[0].className = 'sort'
      } else {
        headerEl.getElementsByTagName('span')[0].className = !headerEl.asc ? 'sort up' : 'sort'
      }
    }

    document.querySelectorAll('th').forEach(function (th) {
      return th.addEventListener('click', function () {
        applySortClass(this)
        var tbody = document.querySelector('#register-pupils tbody')
        Array.from(tbody.querySelectorAll('tr'))
          .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = this.asc !== undefined ? !this.asc : false))
          .forEach(function (tr) {
            return tbody.appendChild(tr)
          })
      })
    })
  }
})
