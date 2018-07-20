'use strict'
/* global describe, it, expect, spyOn */

const sqlService = require('../../../../services/data-access/sql.service')

describe('pupil-feedback.data.service', () => {
  let service = require('../../../../services/data-access/pupil-feedback.data.service') // , sandbox

  describe('#create', () => {
    it('makes the expected calls', async (done) => {
      spyOn(sqlService, 'create').and.returnValue(Promise.resolve())
      await service.sqlCreate({test: 'property'})
      expect(sqlService.create).toHaveBeenCalled()
      done()
    })
  })
})
