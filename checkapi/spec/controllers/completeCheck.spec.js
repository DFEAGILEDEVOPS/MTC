'use strict'
/* global describe it xit expect */

const sut = require('../../controllers/complete-check')
const httpMock = require('node-mocks-http')

describe('completeCheck controller', () => {
  describe('POST /complete-check', () => {
    const req = httpMock.createRequest({
      method: 'POST',
      url: '/complete-check'
    })

    it('returns 200 OK when request processed successfully', () => {
      const res = httpMock.createResponse()
      sut.completeCheck(req, res)
      expect(res.statusCode).toBe(200)
    })

    xit('submits valid request to completeCheck service', () => {

    })
  })
})
