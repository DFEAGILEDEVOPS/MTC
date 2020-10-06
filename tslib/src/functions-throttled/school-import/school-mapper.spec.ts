
/* global describe expect it beforeEach */

import { SchoolRecordMapper } from './school-mapper'

let sut: SchoolRecordMapper

describe('SchoolDataService', () => {
  beforeEach(() => {
    sut = new SchoolRecordMapper()
  })

  it('should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolRecordMapper)
  })

  it('returns a mapped object with keys as per the mapping object', () => {
    const row = ['Town Primary School', 123456, 'extra', 'data', 9991111]
    const mapping = {
      name: 0,
      urn: 1,
      dfeNumber: 4
    }
    expect(sut.mapRow(row, mapping)).toEqual({
      name: 'Town Primary School',
      urn: 123456,
      dfeNumber: 9991111
    })
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
