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
    it('should call enhanceSelectElement with the templates passed', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector').and.returnValue('selected-element')
      const templates = { template1: 2 }
      window.GOVUK.autoComplete.createComponent('#container', 2, 'default', templates)
      expect(window.accessibleAutocomplete.enhanceSelectElement).toHaveBeenCalledWith({
        selectElement: 'selected-element',
        minLength: 2,
        defaultValue: 'default',
        templates: templates
      })
      expect(document.querySelector).toHaveBeenCalledWith('#container')
    })
  })
  describe('createNameComponent', function () {
    it('should call createComponent with the name templates', function () {
      spyOn(window.GOVUK.autoComplete, 'createComponent')
      window.GOVUK.autoComplete.createNameComponent('#container', 2, 'default')
      expect(window.GOVUK.autoComplete.createComponent).toHaveBeenCalledWith('#container', 2, 'default', jasmine.any(Object))
    })
  })
})
