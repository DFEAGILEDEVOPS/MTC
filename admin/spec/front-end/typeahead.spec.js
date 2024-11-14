'use strict'
/* global $ spyOn jasmine */

describe('autoComplete', function () {
  describe('createComponent', function () {
    it('should call enhanceSelectElement to render the autocomplete component when container id is provided', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.MTCAdmin.autoComplete.createComponent('#container', 2, '')
      expect(window.accessibleAutocomplete.enhanceSelectElement).toHaveBeenCalled()
      expect(document.querySelector).toHaveBeenCalledWith('#container')
    })
    it('should not call enhanceSelectElement if container id is not provided', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.MTCAdmin.autoComplete.createComponent()
      expect(window.accessibleAutocomplete.enhanceSelectElement).not.toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalled()
    })
    it('should not call enhanceSelectElement if container id is not a string', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector')
      window.MTCAdmin.autoComplete.createComponent(1)
      expect(window.accessibleAutocomplete.enhanceSelectElement).not.toHaveBeenCalled()
      expect(document.querySelector).not.toHaveBeenCalled()
    })
    it('should call enhanceSelectElement with the options passed', function () {
      spyOn(window.accessibleAutocomplete, 'enhanceSelectElement')
      spyOn(document, 'querySelector').and.returnValue('selected-element')
      const extraOptions = { templates: { template1: 2 } }
      window.MTCAdmin.autoComplete.createComponent('#container', 2, 'default', extraOptions)
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
      spyOn(window.MTCAdmin.autoComplete, 'createComponent')
      window.MTCAdmin.autoComplete.createNameComponent('#container', 2, 'default')
      expect(window.MTCAdmin.autoComplete.createComponent).toHaveBeenCalledWith('#container', 2, 'default', jasmine.any(Object))
    })
  })
  describe('createLinkedComponent', function () {
    it('should call createComponent with the autoCompleteContainer', function () {
      spyOn(window, 'accessibleAutocomplete')
      spyOn(document, 'querySelector').and.returnValue('element')
      window.MTCAdmin.autoComplete.createLinkedComponent('#container', 'id', [], 2, '#id', null)
      expect(document.querySelector).toHaveBeenCalledWith('#container')
      expect(window.accessibleAutocomplete).toHaveBeenCalledWith({
        element: 'element',
        id: 'id',
        name: 'id',
        source: [],
        minLength: 2,
        defaultValue: '',
        onConfirm: jasmine.any(Function)
      })
    })
  })
  describe('setupLinkedConfirm', function () {
    let fixture
    beforeEach(() => {
      fixture = $(`<div>
        <div id="container1"></div>
        <div id="container2"></div>
      </div>`)
      $('body').append(fixture)
      const source1 = ['source1_1', 'source1_2']
      const source2 = ['source2_1', 'source2_2']
      window.MTCAdmin.autoComplete.createLinkedComponent('#container1', 'id1', source1, 2, '#container2', null)
      window.MTCAdmin.autoComplete.createLinkedComponent('#container2', 'id2', source2, 2, '#container1', null)
    })
    afterEach(() => {
      fixture.remove()
    })
    it('should populate the value of the second container based on the first one', function () {
      const f = jasmine.createSpy().and.callFake(() => 'source2_2')
      var cb = window.MTCAdmin.autoComplete.setupLinkedConfirm('#container1', '#container2', f)
      var event = {}
      var value = 'source1_2'
      // trigger the onconfirm function
      cb(event, value)
      expect(f).toHaveBeenCalledWith(value)
      expect($('#container2').find('input').val()).toBe('source2_2')
    })
    it('should populate the value of the first container based on the second one', function () {
      const f = jasmine.createSpy().and.callFake(() => 'source1_2')
      var cb = window.MTCAdmin.autoComplete.setupLinkedConfirm('#container2', '#container1', f)
      var event = {}
      var value = 'source2_2'
      // trigger the onconfirm function
      cb(event, value)
      expect(f).toHaveBeenCalledWith(value)
      expect($('#container1').find('input').val()).toBe('source1_2')
    })
  })
})
