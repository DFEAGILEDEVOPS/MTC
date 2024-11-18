'use strict'
/**
 * Autocomplete component
 */

if (!window.MTCAdmin) {
  window.MTCAdmin = {}
}

(function () {
  window.MTCAdmin.autoComplete = {
    /**
     * Utilises and renders general accessible autcomplete enhanced select list component
     * @param {String} autoCompleteContainer
     * @param {Number} minLength
     * @param {String} defaultValue
     * @param {Object} extraOptions
     * @returns {void}
     */
    createComponent: function (autoCompleteContainer, minLength, defaultValue, extraOptions) {
      if (autoCompleteContainer && typeof autoCompleteContainer === 'string') {
        return window.accessibleAutocomplete.enhanceSelectElement($.extend(
          {
            selectElement: document.querySelector(autoCompleteContainer),
            minLength,
            defaultValue
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
        return result
      }

      function suggestionTemplate (result) {
        return result
      }

      window.MTCAdmin.autoComplete.createComponent(
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
     * @param {int} id
     * @param {Array} source
     * @param {Number} minLength
     * @param {String} linkedContainer
     * @param findValueFunc
     * @returns {void}
     */
    createLinkedComponent: function (autoCompleteContainer, id, source, minLength, linkedContainer, findValueFunc) {
      window.accessibleAutocomplete({
        element: document.querySelector(autoCompleteContainer),
        id,
        name: id,
        source,
        minLength,
        defaultValue: '',
        onConfirm: function (name) {
          $(autoCompleteContainer).trigger('confirm', [name])
        }
      })
      $(autoCompleteContainer).on('confirm', window.MTCAdmin.autoComplete.setupLinkedConfirm(autoCompleteContainer, linkedContainer, findValueFunc))
    },

    /**
      * Sets up the custom on confirm event handler
      * @param {String} autoCompleteContainer
      * @param {String} linkedContainer]
      * @param findValueFunc
      * @returns {void}
      */
    setupLinkedConfirm: function (autoCompleteContainer, linkedContainer, findValueFunc) {
      return function (event, value) {
        if (typeof value === 'undefined') return
        var ul = $(linkedContainer).find('ul')
        /*
         * The autocomplete library triggers the dropdown when setting the value on the linkedContainer
         * we need to hide the menu using the style attribute, wait for the dropdown to appear,
         * change the dropdown class then remove the style attribute
         */
        ul.style = 'display: none'
        $(linkedContainer).find('input').val(findValueFunc(value))
        setTimeout(function () {
          ul.removeClass('autocomplete__menu--visible').addClass('autocomplete__menu--hidden')
          ul[0].style = ''
        }, 100)
      }
    }
  }
})()
