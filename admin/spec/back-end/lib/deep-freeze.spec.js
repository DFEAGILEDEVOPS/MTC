'use strict'

const sut = require('../../../lib/deep-freeze')

describe('deep-freeze', () => {
  test('performs a standard freeze if no child objects are present', () => {
    const obj = {}
    const actual = sut(obj)
    expect(Object.isFrozen(actual)).toBe(true)
    expect(actual).toBe(obj)
  })
  test('freezes child objects', () => {
    const obj = {
      child: {}
    }
    const actual = sut(obj)
    expect(Object.isFrozen(actual.child)).toBe(true)
  })
  test('freezes recursively', () => {
    const obj = {
      child1: {
        child2: {
          child3: {
          }
        }
      }
    }
    const actual = sut(obj)
    expect(Object.isFrozen(actual.child1.child2)).toBe(true)
    expect(Object.isFrozen(actual.child1.child2.child3)).toBe(true)
  })
})
