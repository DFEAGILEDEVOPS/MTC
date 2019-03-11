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
     * Utilises and renders general accessible autcomplete select list component
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
     * @param {Object} templates
     * @returns {void}
     */
    createComponent: function (autoCompleteContainer, minLength, defaultValue, templates) {
      if (!templates) templates = {}

      if (autoCompleteContainer && typeof autoCompleteContainer === 'string') {
        return window.accessibleAutocomplete.enhanceSelectElement({
          selectElement: document.querySelector(autoCompleteContainer),
          minLength: minLength,
          defaultValue: defaultValue,
          templates: templates
        })
      }
    },

    /**
     * Utilises and renders accessible autcomplete select list component for name fields
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
     * @param {Object} templates
     * @returns {void}
     */
    createNameComponent: function (autoCompleteContainer, minLength, defaultValue) {
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

      this.createComponent(
        autoCompleteContainer,
        minLength,
        defaultValue,
        {
          inputValue: inputValueTemplate,
          suggestion: suggestionTemplate
        }
      )
    }
  }
})
