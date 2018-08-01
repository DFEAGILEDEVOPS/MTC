/**
 * Typeahead component
 */

/* global $ */
$(function () {
  'use strict'
  if (!window.GOVUK) {
    window.GOVUK = {}
  }
  window.GOVUK.typeahead = {
    /**
     * Utilises and renders accessible autcomplete select list component
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
     * @returns {void}
     */
    createComponent: function (autoCompleteContainer, minLength, defaultValue) {
      if (autoCompleteContainer && typeof autoCompleteContainer === 'string') {
        return window.accessibleAutocomplete.enhanceSelectElement({
          selectElement: document.querySelector(autoCompleteContainer),
          minLength: minLength,
          defaultValue: defaultValue
        })
      }
    }
  }
})
