'use strict'

const tableSort = require('../../../helpers/table-sorting')

describe('tableSort', function () {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('comparer', function () {
    test('should return 1 if second value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('beta', 'alpha', true)
      expect(result).toBe(1)
    })
    test('should return -1 if the first value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('alpha', 'beta', true)
      expect(result).toBe(-1)
    })
    test('should return 1 if second value needs to be sorted first on descending order', function () {
      const result = tableSort.comparer('alpha', 'beta', false)
      expect(result).toBe(1)
    })
    test('should return -1 if first value needs to be sorted first on descending order', function () {
      const result = tableSort.comparer('beta', 'alpha', false)
      expect(result).toBe(-1)
    })
    test('should return 0 if value are equal', function () {
      const result = tableSort.comparer('alpha', 'alpha', true)
      expect(result).toBe(0)
    })
    test('should return 1 if the second stringified number value needs to be sorted first on ascending order', function () {
      const result = tableSort.comparer('2', '1', true)
      expect(result).toBe(1)
    })
    test('should call return 0 if the values are equal stringified numbers', function () {
      const result = tableSort.comparer('1', '1', true)
      expect(result).toBe(0)
    })
    test('should call getNumberComparisonResult if the values are stringified numbers', function () {
      jest.spyOn(tableSort, 'getNumberComparisonResult').mockReturnValue(0)
      jest.spyOn(tableSort, 'getStringComparisonResult').mockImplementation()
      tableSort.comparer('1', '1', true)
      expect(tableSort.getStringComparisonResult).not.toHaveBeenCalled()
      expect(tableSort.getNumberComparisonResult).toHaveBeenCalled()
    })
    test('should call getStringComparisonResult if the values include combinations of letters and numbers', function () {
      jest.spyOn(tableSort, 'getNumberComparisonResult').mockReturnValue(0)
      jest.spyOn(tableSort, 'getStringComparisonResult').mockImplementation()
      tableSort.comparer('1', '2a', true)
      expect(tableSort.getStringComparisonResult).toHaveBeenCalled()
      expect(tableSort.getNumberComparisonResult).not.toHaveBeenCalled()
    })
  })
  describe('isEmpty', function () {
    test('should return false if value is not an empty string', function () {
      const result = tableSort.isEmpty('-')
      expect(result).toBeFalsy()
    })
    test('should return true if value is empty string', function () {
      const result = tableSort.isEmpty('')
      expect(result).toBeTruthy()
    })
    test('should return true if value is null', function () {
      const result = tableSort.isEmpty(null)
      expect(result).toBeTruthy()
    })
    test('should return true if value is undefined', function () {
      const result = tableSort.isEmpty(undefined)
      expect(result).toBeTruthy()
    })
  })
  describe('applySorting', function () {
    test('should call comparer to sort array values', function () {
      jest.spyOn(tableSort, 'comparer').mockReturnValue([])
      tableSort.applySorting([{ lastName: 'lastName1' }, { lastName: 'lastName2' }], 'lastName', true)
      expect(tableSort.comparer).toHaveBeenCalled()
    })
  })
  describe('isNumericValue', function () {
    test('returns true if the value is a stringified number', function () {
      const result = tableSort.isNumericValue('1')
      expect(result).toBeTruthy()
    })
    test('returns true if the value is a number', function () {
      const result = tableSort.isNumericValue(1)
      expect(result).toBeTruthy()
    })
    test('returns false if the value is a stringified combination of letters and numbers', function () {
      const result = tableSort.isNumericValue('1a')
      expect(result).toBeFalsy()
    })
    test('returns false if the value is an empty string', function () {
      const result = tableSort.isNumericValue('')
      expect(result).toBeFalsy()
    })
  })
  describe('getNumberComparisonResult', function () {
    test('returns negative number when the second value is greaer than the first in ascending order', function () {
      const result = tableSort.getNumberComparisonResult(1, 2, true)
      expect(result).toBe(-1)
    })
    test('returns positive number when the second value is greaer than the first in descending order', function () {
      const result = tableSort.getNumberComparisonResult(1, 2, false)
      expect(result).toBe(1)
    })
    test('returns negative number when the first value is greater than the second in ascending order', function () {
      const result = tableSort.getNumberComparisonResult(2, 1, true)
      expect(result).toBe(1)
    })
    test('returns positive number when the first value is greater than the second in descending order', function () {
      const result = tableSort.getNumberComparisonResult(2, 1, false)
      expect(result).toBe(-1)
    })
    test('returns 0 if they values are equal regardless of sorting type', function () {
      const result = tableSort.getNumberComparisonResult(1, 1, true)
      expect(result).toBe(0)
    })
  })

  describe('sortByProps', () => {
    test('sorts strings', () => {
      const strings = [{ a: 'bbb' }, { a: 'aaa' }, { a: 'ccc' }]
      const res = tableSort.sortByProps(['a'], strings)
      expect(res).toEqual([{ a: 'aaa' }, { a: 'bbb' }, { a: 'ccc' }])
    })

    test('sorts numbers', () => {
      const list = [{ a: 4 }, { a: 3 }, { a: 10 }]
      const res = tableSort.sortByProps(['a'], list)
      expect(res).toEqual([{ a: 3 }, { a: 4 }, { a: 10 }])
    })

    test('does secondary and tertiary sort', () => {
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
