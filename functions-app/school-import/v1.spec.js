'use strict'
/* global describe, it, expect */

const sut = require('./v1.js')

describe('#v1', () => {
  it('is defined', () => {
    expect(sut).toBeDefined()
  })

  it('has a process function', () => {
    expect(sut.process).toBeDefined()
  })

  describe('#mapColums', () => {
    it('is defined', () => {
      expect(sut.mapColumns).toBeDefined()
    })

    it('return the column index for the desired columns', () => {
      const headerRow = ['Row A', 'ROW (B)', 'Stuff', '&', 'Nonsense', 'Row ("C")']
      const desiredRows = [
        ['Row A', 'rowA'],
        ['ROW (B)', 'rowB'],
        ['Row ("C")', 'rowC']
      ]
      const mapping = sut.mapColumns(headerRow, desiredRows)
      expect(mapping).toEqual({
        rowA: 0,
        rowB: 1,
        rowC: 5
      })
    })

    it('throws an error with all the headers it cant find', () => {
      const headerRow = ['a', 'b', 'c']
      const desiredRows = [
        ['d', 'd'],
        ['e', 'e'],
        ['f', 'f']
      ]
      expect(() => { sut.mapColumns(headerRow, desiredRows) }).toThrowError('Headers "d", "e", "f" not found')
    })
  })
})
