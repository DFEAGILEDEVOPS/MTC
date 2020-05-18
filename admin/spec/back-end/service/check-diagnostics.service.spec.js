'use strict'

/* globals describe expect it spyOn */

const sut = require('../../../services/check-diagnostics.service')
const dataService = require('../../../services/data-access/check-diagnostics.data.service')

const checkCode = 'dd3ed042-648f-49bd-a559-45127596716d'

describe('check diagnostics service', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should return check record when exists', async () => {
    spyOn(dataService, 'getByCheckCode').and.returnValue([{}])
    const actual = await sut.getByCheckCode(checkCode)
    expect(typeof actual).toBe('object')
  })

  it('should return undefined when check not found', async () => {
    const actual = await sut.getByCheckCode(checkCode)
    expect(actual).toBeUndefined()
  })
})
