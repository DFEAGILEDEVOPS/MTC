/* global describe, it, expect */

const arrayUtils = require('../../lib/array-utils')

describe('arrayUtils', () => {
  describe('isEmptyArray', () => {
    it('identifies an array of empty strings as being empty', () => {
      const bool = arrayUtils.isEmptyArray([ '', '', '' ])
      expect(bool).toBeTruthy()
    })
    it('arrays with a non-empty string are not empty #1', () => {
      const bool = arrayUtils.isEmptyArray([ 'test', '', '' ])
      expect(bool).toBeFalsy()
    })
    it('arrays with a non-empty string are not empty #2', () => {
      const bool = arrayUtils.isEmptyArray([ '', 'test', '' ])
      expect(bool).toBeFalsy()
    })
    it('arrays with a non-empty string are not empty #3', () => {
      const bool = arrayUtils.isEmptyArray([ '', '', 'test' ])
      expect(bool).toBeFalsy()
    })
  })

  describe('omitEmptyArrays', () => {
    it('removes empty arrays from a list of arrays', () => {
      const input = [
        [ 'headA', 'headB' ],
        [ 'line', 'line' ],
        [ 'line2A', 'line2B' ],
        [ '', '' ],
        [ '', '' ]
      ]
      const cleaned = arrayUtils.omitEmptyArrays(input)
      expect(cleaned.length).toBe(3)
      expect(cleaned[ 0 ][ 0 ]).toBe('headA')
      expect(cleaned[ 0 ][ 1 ]).toBe('headB')
      expect(cleaned[ 2 ][ 0 ]).toBe('line2A')
      expect(cleaned[ 2 ][ 1 ]).toBe('line2B')
    })
  })

  describe('countNonEmptyRows', () => {
    it('counts arrays that are not empty according to isEmptyArray()', () => {
      const input = [
        ['a', 'non', 'empty', 'array'],
        ['', '', ''], // empty
        ['another', 'line'],
        ['', '', '', ''] // empty
      ]
      const i = arrayUtils.countNonEmptyRows(input)
      expect(i).toBe(2)
    })
    it('throws an error if passed a string as argument', () => {
      expect(() => { arrayUtils.countNonEmptyRows('string') }).toThrow()
    })
    it('throws an error if passed null as an argument', () => {
      expect(() => { arrayUtils.countNonEmptyRows(null) }).toThrow()
    })
    it('throws an error if passed undefined as an argument', () => {
      expect(() => { arrayUtils.countNonEmptyRows(undefined) }).toThrow()
    })
    it('throws an error if passed a number as an argument', () => {
      expect(() => { arrayUtils.countNonEmptyRows(9) }).toThrow()
    })
    it('throws an error if passed an object as an argument', () => {
      expect(() => { arrayUtils.countNonEmptyRows({foo: 'bar'}) }).toThrow()
    })
  })
})
