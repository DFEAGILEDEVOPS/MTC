'use strict'
/* global describe it expect spyOn */

describe('autoComplete', function () {
  describe('createComponent', function () {
    it('should call enhanceSelectElement to render the autocomplete component when container id is provided', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.GOVUK.autoComplete.createComponent('#container', 2, '')
      expect(window.accessibleAutocomplete.enhanceSelectElement).toHaveBeenCalled()
      expect(document.querySelector).toHaveBeenCalledWith('#container')
    })
    it('should not call enhanceSelectElement if container id is not provided', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.GOVUK.autoComplete.createComponent()
      expect(window.accessibleAutocomplete.enhanceSelectElement).not.toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalled()
    })
    it('should not call enhanceSelectElement if container id is not a string', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.GOVUK.autoComplete.createComponent(1)
      expect(window.accessibleAutocomplete.enhanceSelectElement).not.toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalled()
    })
  })
})
