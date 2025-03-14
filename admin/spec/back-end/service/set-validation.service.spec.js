'use strict'

describe('setValidationService', () => {
  const service = require('../../../services/set-validation.service')
  test('finds differences when there are some', async () => {
    const a1 = [1, 2, 3, 4]
    const db1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const diff = service.validate(a1, db1)
    expect(diff).toEqual(new Set([4]))
  })

  test('does not find differences when there arent any', async () => {
    const a1 = [1, 2, 3]
    const db1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const diff = service.validate(a1, db1)
    expect(diff.size).toBe(0)
  })

  test('it finds differences when comparing strings with numbers', async () => {
    const a1 = ['1', '2', '3']
    const db1 = [{ id: 1 }, { id: 2 }, { id: 3 }]
    const diff = service.validate(a1, db1)
    expect(diff.size).toBe(3)
  })
})
