'use strict'

/* global describe, beforeEach, afterEach, it, expect fail */

const sut = require('./../../../services/data-access/sql.service')

describe('sql.service', () => {
  beforeEach('set up connection to server', () => {

  })

  describe('#query', () => {
    it('does not allow parameterless queries (full table)', () => {
      try {
        sut.query('SELECT * FROM Pupil')
        fail('query should throw an error due to missing parameters')
      } catch (error) {
        expect(error.message).toBe('expected at least 1 parameter')
      }
    })
  })
})
