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
     * @param {Object} extraOptions
     * @returns {void}
     */
    createComponent: function (autoCompleteContainer, minLength, defaultValue, extraOptions) {
      if (autoCompleteContainer && typeof autoCompleteContainer === 'string') {
        return window.accessibleAutocomplete.enhanceSelectElement(Object.assign(
          {
            selectElement: document.querySelector(autoCompleteContainer),
            minLength: minLength,
            defaultValue: defaultValue
          },
          extraOptions
        ))
      }
    },

    /**
     * Utilises and renders accessible autcomplete select list component for name fields
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
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

      window.GOVUK.autoComplete.createComponent(
        autoCompleteContainer,
        minLength,
        defaultValue,
        {
          templates: {
            inputValue: inputValueTemplate,
            suggestion: suggestionTemplate
          }
        }
      )
    },

    /**
     * Links two autocomplete fields to autopopulate each other
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} linkedContainer
     * @returns {void}
     */
    createLinkedComponent: function (autoCompleteContainer, minLength, linkedContainer) {
      window.GOVUK.autoComplete.createComponent(autoCompleteContainer, minLength, '', {
        onConfirm: function (name) {
          $(autoCompleteContainer).trigger('confirm', [name])
        }
      })
      $(autoCompleteContainer).on('confirm', window.GOVUK.autoComplete.setupLinkedConfirm(autoCompleteContainer, linkedContainer))
    },

    /**
      * Sets up the custom on confirm event handler
      * @param {String} autoCompleteContainer
      * @param {String} linkedContainer
      * @returns {void}
      */
    setupLinkedConfirm: function (autoCompleteContainer, linkedContainer) {
      return function (event, value) {
        if (typeof value === 'undefined') return
        $(linkedContainer).val('')
        var inputText = $(linkedContainer + '-select option')
          .filter(function () {
            return $(this).val() === value
          })
          .first()
          .html()
        $(linkedContainer).attr('placeholder', inputText)
        $(linkedContainer + '-select').val(value).trigger('change')
      }
    }
  }
})
