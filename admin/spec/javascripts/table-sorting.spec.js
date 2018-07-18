'use strict'
/* global describe it expect spyOn */

describe('tableSort', function () {
  describe('getCellValue', function () {
    it('should return the text of the element', function () {
      const mockRow = {
        children: [
          {
            innerText: 'value'
          }
        ]
      }
      const result = window.GOVUK.tableSort.getCellValue(mockRow, 0)
      expect(result).toBe('value')
    })
  })
  describe('comparer', function () {
    it('should return 1 if second elements needs to be sorted first on ascending order', function () {
      spyOn(window.GOVUK.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.GOVUK.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return -1 if first elements needs to be sorted first on ascending order', function () {
      spyOn(window.GOVUK.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.GOVUK.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return -1 if second elements needs to be sorted first on ascending order', function () {
      spyOn(window.GOVUK.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.GOVUK.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return 1 if first elements needs to be sorted first on ascending order', function () {
      spyOn(window.GOVUK.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.GOVUK.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return 0 if elements are equal', function () {
      spyOn(window.GOVUK.tableSort, 'getCellValue').and.returnValues('alpha', 'alpha')
      const result = window.GOVUK.tableSort.comparer(0, false, {})('alpha', 'alpha')
      expect(result).toBe(0)
    })
  })
  describe('isNullString', function () {
    it('should return false if config is not set', function () {
      const result = window.GOVUK.tableSort.isNullString('value', {})
      expect(result).toBeFalsy()
    })
    it('should return true if element is empty string', function () {
      const result = window.GOVUK.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
    it('should return true if element is empty string', function () {
      const result = window.GOVUK.tableSort.isNullString('', { sortNullsLast: true })
      expect(result).toBeTruthy()
    })
    it('should return true if element is ignored string', function () {
      const result = window.GOVUK.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
  })
  describe('applySortClass', function () {
    it('should add descending sorting class if order is undefined', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {}
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.GOVUK.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon desc')
    })
    it('should add ascending sorting class if order was descending', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {},
        asc: false
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.GOVUK.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon asc')
    })
    it('should add descending sorting class if order was ascending', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([{ className: '' }])
      const header = {
        getElementsByTagName: function () {},
        asc: true
      }
      const headerSpan = { className: '' }
      spyOn(header, 'getElementsByTagName').and.returnValue([headerSpan])
      window.GOVUK.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon desc')
    })
  })
  describe('applySorting', function () {
    it('should call querySelectorAll to fetch all th elements', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([])
      window.GOVUK.tableSort.applySorting(window.document, 'tableId', {})
      expect(document.querySelectorAll).toHaveBeenCalled()
    })
    it('should attach event listeners for all th elements', function () {
      const tableHeaders = [
        { addEventListener: function () {} }
      ]
      spyOn(document, 'querySelectorAll').and.returnValue(tableHeaders)
      spyOn(tableHeaders[0], 'addEventListener')
      window.GOVUK.tableSort.applySorting(window.document, 'tableId', {})
      expect(tableHeaders[0].addEventListener).toHaveBeenCalled()
    })
  })
})
