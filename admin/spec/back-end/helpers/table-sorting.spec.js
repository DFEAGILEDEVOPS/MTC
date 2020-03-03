'use strict'
/* global describe it expect spyOn */

const tableSort = require('../../../helpers/table-sorting')

describe('tableSort', function () {
  describe('comparer', function () {
    it('should return 1 if second value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('beta', 'alpha', true)
      expect(result).toBe(1)
    })
    it('should return -1 if the first value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('alpha', 'beta', true)
      expect(result).toBe(-1)
    })
    it('should return 1 if second value needs to be sorted first on descending order', function () {
      const result = tableSort.comparer('alpha', 'beta', false)
      expect(result).toBe(1)
    })
    it('should return -1 if first value needs to be sorted first on descending order', function () {
      const result = tableSort.comparer('beta', 'alpha', false)
      expect(result).toBe(-1)
    })
    it('should return 0 if value are equal', function () {
      const result = tableSort.comparer('alpha', 'alpha', true)
      expect(result).toBe(0)
    })
    it('should return 1 if the second stringified number value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('2', '1', true)
      expect(result).toBe(1)
    })
    it('should call return 0 if the values are equal stringified numbers', function () {
      const result = tableSort.comparer('1', '1', true)
      expect(result).toBe(0)
    })
    it('should call getNumberComparisonResult if the values are stringified numbers', function () {
      spyOn(tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(tableSort, 'getStringComparisonResult')
      tableSort.comparer('1', '1', true)
      expect(tableSort.getStringComparisonResult).not.toHaveBeenCalled()
      expect(tableSort.getNumberComparisonResult).toHaveBeenCalled()
    })
    it('should call getStringComparisonResult if the values include combinations of letters and numbers', function () {
      spyOn(tableSort, 'getNumberComparisonResult').and.returnValue(0)
      spyOn(tableSort, 'getStringComparisonResult')
      tableSort.comparer('1', '2a', true)
      expect(tableSort.getStringComparisonResult).toHaveBeenCalled()
      expect(tableSort.getNumberComparisonResult).not.toHaveBeenCalled()
    })
  })
  describe('isEmpty', function () {
    it('should return false if value is not an empty string', function () {
      const result = tableSort.isEmpty('-')
      expect(result).toBeFalsy()
    })
    it('should return true if value is empty string', function () {
      const result = tableSort.isEmpty('')
      expect(result).toBeTruthy()
    })
    it('should return true if value is null', function () {
      const result = tableSort.isEmpty(null)
      expect(result).toBeTruthy()
    })
    it('should return true if value is undefined', function () {
      const result = tableSort.isEmpty(undefined)
      expect(result).toBeTruthy()
    })
  })
  describe('applySorting', function () {
    it('should call comparer to sort array values', function () {
      spyOn(tableSort, 'comparer').and.returnValue([])
      tableSort.applySorting([{ lastName: 'lastName1' }, { lastName: 'lastName2' }], 'lastName', true)
      expect(tableSort.comparer).toHaveBeenCalled()
    })
  })
  describe('isNumericValue', function () {
    it('returns true if the value is a stringified number', function () {
      const result = tableSort.isNumericValue('1')
      expect(result).toBeTruthy()
    })
    it('returns true if the value is a number', function () {
      const result = tableSort.isNumericValue(1)
      expect(result).toBeTruthy()
    })
    it('returns false if the value is a stringified combination of letters and numbers', function () {
      const result = tableSort.isNumericValue('1a')
      expect(result).toBeFalsy()
    })
    it('returns false if the value is an empty string', function () {
      const result = tableSort.isNumericValue('')
      expect(result).toBeFalsy()
    })
  })
  describe('getNumberComparisonResult', function () {
    it('returns negative number when the second value is greaer than the first in ascending order', function () {
      const result = tableSort.getNumberComparisonResult(1, 2, true)
      expect(result).toBe(-1)
    })
    it('returns positive number when the second value is greaer than the first in descending order', function () {
      const result = tableSort.getNumberComparisonResult(1, 2, false)
      expect(result).toBe(1)
    })
    it('returns negative number when the first value is greater than the second in ascending order', function () {
      const result = tableSort.getNumberComparisonResult(2, 1, true)
      expect(result).toBe(1)
    })
    it('returns positive number when the first value is greater than the second in descending order', function () {
      const result = tableSort.getNumberComparisonResult(2, 1, false)
      expect(result).toBe(-1)
    })
    it('returns 0 if they values are equal regardless of sorting type', function () {
      const result = tableSort.getNumberComparisonResult(1, 1, true)
      expect(result).toBe(0)
    })
  })

  describe('sortByProps', () => {
    it('sorts strings', () => {
      const strings = [{ a: 'bbb' }, { a: 'aaa' }, { a: 'ccc' }]
      const res = tableSort.sortByProps(['a'], strings)
      expect(res).toEqual([{ a: 'aaa' }, { a: 'bbb' }, { a: 'ccc' }])
    })

    it('sorts numbers', () => {
      const list = [{ a: 4 }, { a: 3 }, { a: 10 }]
      const res = tableSort.sortByProps(['a'], list)
      expect(res).toEqual([{ a: 3 }, { a: 4 }, { a: 10 }])
    })

    it('does secondary and tertiary sort', () => {
      const list = [
        { a: 1, b: 2, c: 3 },
        { a: 10, b: 10, c: 10 },
        { a: 10, b: 6, c: 0 },
        { a: 1, b: 2, c: 1 },
        { a: 100 }
      ]
      const res = tableSort.sortByProps(['a', 'b', 'c'], list)
      expect(res).toEqual([
        { a: 1, b: 2, c: 1 },
        { a: 1, b: 2, c: 3 },
        { a: 10, b: 6, c: 0 },
        { a: 10, b: 10, c: 10 },
        { a: 100 }
      ])
    })
  })
})
