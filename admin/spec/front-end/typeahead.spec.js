'use strict'
/* global $ describe it expect spyOn jasmine beforeEach afterEach */

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
    it('should call enhanceSelectElement with the options passed', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector').and.returnValue('selected-element')
      const extraOptions = { templates: { template1: 2 } }
      window.GOVUK.autoComplete.createComponent('#container', 2, 'default', extraOptions)
      expect(window.accessibleAutocomplete.enhanceSelectElement).toHaveBeenCalledWith({
        selectElement: 'selected-element',
        minLength: 2,
        defaultValue: 'default',
        ...extraOptions
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
  describe('createLinkedComponent', function () {
    it('should call createComponent with the autoCompleteContainer', function () {
      spyOn(window.GOVUK.autoComplete, 'createComponent')
      window.GOVUK.autoComplete.createLinkedComponent('#container', 2, '#container2')
      expect(window.GOVUK.autoComplete.createComponent).toHaveBeenCalledWith('#container', 2, '', { onConfirm: jasmine.any(Function) })
    })
  })
  describe('setupLinkedConfirm', function () {
    let fixture
    beforeEach(() => {
      fixture = $(`<div>
        <select id="container1" name="container2">
          <option value="op-1">Option 1</option>
          <option value="op-2">Option 2</option>
        </select>
        <select id="container2" name="container1">
          <option value="Option 1">op-1</option>
          <option value="Option 2">op-2</option>
        </select>
      </div>`)
      $('body').append(fixture)
      window.GOVUK.autoComplete.createLinkedComponent('#container1', 2, '#container2')
      window.GOVUK.autoComplete.createLinkedComponent('#container2', 2, '#container1')
    })
    afterEach(() => {
      fixture.remove()
    })
    it('should populate the value of the second container based on the first one', function () {
      var cb = window.GOVUK.autoComplete.setupLinkedConfirm('#container1', '#container2')
      var event = {}
      var value = 'Option 2'
      // trigger the onconfirm function
      cb(event, value)
      expect($('#container2').attr('placeholder')).toBe('op-2')
      expect($('#container2-select').val()).toBe('Option 2')
      expect($('#container1-select').val()).toBe('op-2')
    })
    it('should populate the value of the first container based on the second one', function () {
      var cb = window.GOVUK.autoComplete.setupLinkedConfirm('#container2', '#container1')
      var event = {}
      var value = 'op-2'
      // trigger the onconfirm function
      cb(event, value)
      expect($('#container1').attr('placeholder')).toBe('Option 2')
      expect($('#container1-select').val()).toBe('op-2')
      expect($('#container2-select').val()).toBe('Option 2')
    })
  })
})
