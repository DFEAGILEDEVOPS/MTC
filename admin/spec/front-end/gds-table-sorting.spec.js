'use strict'

/* global spyOn */

describe('tableSort', function () {
  describe('getCellValue', function () {
    it('should return the text of the element', function () {
      const mockRow = {
        children: [
          {
            innerText: 'value',
            classList: { contains: () => false }
          }
        ]
      }
      const result = window.MTCAdmin.tableSort.getCellValue(mockRow, 0)
      expect(result).toBe('value')
    })
  })
  describe('comparer', function () {
    it('should return 1 if second elements needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return -1 if first elements needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return -1 if second elements needs to be sorted first on descending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('beta', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(-1)
    })
    it('should return 1 if first elements needs to be sorted first on descending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'beta')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'beta')
      expect(result).toBe(1)
    })
    it('should return 0 if elements are equal', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('alpha', 'alpha')
      const result = window.MTCAdmin.tableSort.comparer(0, false, {})('alpha', 'alpha')
      expect(result).toBe(0)
    })
    it('should return 1 if the second stringified number element needs to be sorted first on ascending order', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('2', '1')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('1', '2')
      expect(result).toBe(1)
    })
    it('should call return 0 if the elements are equal stringified numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1', '1')
      const result = window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(result).toBe(0)
    })
    it('should call getNumberComparisonResult if the values are stringified numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1', '1')
      spyOn(window.MTCAdmin.tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(window.MTCAdmin.tableSort, 'getStringComparisonResult')
      window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(window.MTCAdmin.tableSort.getStringComparisonResult).not.toHaveBeenCalled()
      expect(window.MTCAdmin.tableSort.getNumberComparisonResult).toHaveBeenCalled()
    })
    it('should call getStringComparisonResult if the values include combinations of letters and numbers', function () {
      spyOn(window.MTCAdmin.tableSort, 'getCellValue').and.returnValues('1a', '1')
      spyOn(window.MTCAdmin.tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(window.MTCAdmin.tableSort, 'getStringComparisonResult')
      window.MTCAdmin.tableSort.comparer(0, true, {})('1', '1')
      expect(window.MTCAdmin.tableSort.getStringComparisonResult).toHaveBeenCalled()
      expect(window.MTCAdmin.tableSort.getNumberComparisonResult).not.toHaveBeenCalled()
    })
  })
  describe('isNullString', function () {
    it('should return false if config is not set', function () {
      const result = window.MTCAdmin.tableSort.isNullString('value', {})
      expect(result).toBeFalsy()
    })
    it('should return true if element is empty string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
    it('should return true if element is empty string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('', { sortNullsLast: true })
      expect(result).toBeTruthy()
    })
    it('should return true if element is ignored string', function () {
      const result = window.MTCAdmin.tableSort.isNullString('-', { sortNullsLast: true, ignoredStrings: ['-'] })
      expect(result).toBeTruthy()
    })
    it('should return false if configured to sort null values last but no ignored string is provided', function () {
      const result = window.MTCAdmin.tableSort.isNullString('test', { sortNullsLast: true, ignoredStrings: [] })
      expect(result).toBeFalsy()
    })
    it('should return false if configured to sort null values last but no ignored string detected in values', function () {
      const result = window.MTCAdmin.tableSort.isNullString('test', { sortNullsLast: true, ignoredStrings: ['N/A'] })
      expect(result).toBeFalsy()
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
      window.MTCAdmin.tableSort.applySortClass(header)
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
      window.MTCAdmin.tableSort.applySortClass(header)
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
      window.MTCAdmin.tableSort.applySortClass(header)
      expect(headerSpan.className).toBe('sort-icon desc')
    })
  })
  describe('applySorting', function () {
    it('should call querySelectorAll to fetch all th elements', function () {
      spyOn(document, 'querySelectorAll').and.returnValue([])
      window.MTCAdmin.tableSort.applySorting(window.document, 'tableId', {})
      expect(document.querySelectorAll).toHaveBeenCalled()
    })
    it('should attach event listeners for all th elements', function () {
      const tableHeaders = [
        { addEventListener: function () {} }
      ]
      spyOn(document, 'querySelectorAll').and.returnValue(tableHeaders)
      spyOn(tableHeaders[0], 'addEventListener')
      window.MTCAdmin.tableSort.applySorting(window.document, 'tableId', {})
      expect(tableHeaders[0].addEventListener).toHaveBeenCalled()
    })
  })
  describe('isNumericValue', function () {
    it('returns true if the value is a stringified number', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('1')
      expect(result).toBeTruthy()
    })
    it('returns true if the value is a number', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue(1)
      expect(result).toBeTruthy()
    })
    it('returns false if the value is a stringified combination of letters and numbers', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('1a')
      expect(result).toBeFalsy()
    })
    it('returns false if the value is an empty string', function () {
      const result = window.MTCAdmin.tableSort.isNumericValue('')
      expect(result).toBeFalsy()
    })
  })
  describe('getNumberComparisonResult', function () {
    it('returns negative number when the second value is greaer than the first in ascending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 2, true)
      expect(result).toBe(-1)
    })
    it('returns positive number when the second value is greaer than the first in descending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 2, false)
      expect(result).toBe(1)
    })
    it('returns negative number when the first value is greater than the second in ascending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(2, 1, true)
      expect(result).toBe(1)
    })
    it('returns positive number when the first value is greater than the second in descending order', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(2, 1, false)
      expect(result).toBe(-1)
    })
    it('returns 0 if they values are equal regardless of sorting type', function () {
      const result = window.MTCAdmin.tableSort.getNumberComparisonResult(1, 1, true)
      expect(result).toBe(0)
    })
  })
})
