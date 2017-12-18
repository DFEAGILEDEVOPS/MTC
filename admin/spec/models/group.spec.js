'use strict'

/* global beforeEach, describe, it, expect */

require('sinon-mongoose')
const Group = require('../../models/group')

describe('\'group\' schema', () => {
  let group

  describe('Correctly validates a valid model', () => {
    beforeEach(() => {
      group = new Group({
        name: 'Test Group 1',
        pupils: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
        isDeleted: false
      })
    })

    it('should require a valid name', function (done) {
      group.validate((err) => {
        expect(err).toBe(null)
        expect(group.name).toBeDefined()
        expect(group.name).toBe('Test Group 1')
        done()
      })
    })

    it('should have valid array of pupils', function (done) {
      group.validate((err) => {
        expect(err).toBe(null)
        expect(group.pupils).toBeDefined()
        expect(group.pupils[0]).toBe('5a324c40c9decb39628b84a2')
        done()
      })
    })

    it('should have true or false for isDeleted', function (done) {
      group.validate((err) => {
        expect(err).toBe(null)
        expect(group.isDeleted).toBeDefined()
        expect(group.isDeleted).toBe(false)
        done()
      })
    })
  })

  describe('Correctly throw errors when model is invalid', () => {
    beforeEach(() => {
      group = new Group({
        name: null
      })
    })

    it('should require a valid name', function (done) {
      group.validate((err) => {
        expect(err.message).toBeDefined()
        expect(err.message).toBe('Group validation failed: name: Path `name` is required.')
        done()
      })
    })
  })
})
