'use strict'

/* global describe expect it spyOn */

const v1 = require('./v1')
const context = require('../mock-context')

describe('census-import: v1', () => {
  describe('process', () => {
    it('calls handleCensusImport', async () => {
      spyOn(v1, 'handleCensusImport')
      await v1.process(context, null)
      expect(v1.handleCensusImport).toHaveBeenCalled()
    })
  })
})
