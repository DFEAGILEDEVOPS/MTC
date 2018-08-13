/**
 * Autocomplete component
 */

/* global $ */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.autoComplete = {
    /**
     * Utilises and renders accessible autcomplete select list component
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
     * @returns {void}
     */
    createComponent: function (autoCompleteContainer, minLength, defaultValue) {
      function inputValueTemplate (result) {
        var splitResult = result && result.split(' ')
        if (splitResult) {
          return splitResult &&
            (splitResult[0] + ', ' + splitResult[1] + (splitResult[2] ? ' ' + splitResult[2] : ''))
        }
        return result
      }

      function suggestionTemplate (result) {
        return result
      }

      if (autoCompleteContainer && typeof autoCompleteContainer === 'string') {
        return window.accessibleAutocomplete.enhanceSelectElement({
          selectElement: document.querySelector(autoCompleteContainer),
          minLength: minLength,
          defaultValue: defaultValue,
          templates: {
            inputValue: inputValueTemplate,
            suggestion: suggestionTemplate
          }
        })
      }
    }
  }
})
