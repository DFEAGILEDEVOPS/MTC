'use strict'

/* global describe expect it */

const sut = require('./school.data.service')

describe('#getMappedData', () => {
  it('is defined', () => {
    expect(sut.getMappedData).toBeDefined()
  })

  it('returns a mapped object with keys as per the mapping object', () => {
    const row = ['Town Primary School', 123456, 'extra', 'data', 9991111]
    const mapping = {
      name: 0,
      urn: 1,
      dfeNumber: 4
    }
    expect(sut.getMappedData(row, mapping)).toEqual({
      name: 'Town Primary School',
      urn: 123456,
      dfeNumber: 9991111
    })
  })
})
