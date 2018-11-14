'use strict'

/* global describe expect it spyOn */

const sqlService = require('less-tedious')
const v1 = require('./v1')

describe('v1-process', () => {
  it('calls sqlService.modify', async () => {
    spyOn(sqlService, 'modify')
    await v1.process('abc-def-123', '2018-12-31T16:23:59.123Z')
    expect(sqlService.modify).toHaveBeenCalled()
  })
})
