
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
})
