'use strict'
/* global describe beforeEach it expect */

const sut = require('../controllers/auth')
const httpMock = require('node-mocks-http')

describe('completeCheck controller', () => {
  describe('POST /completeCheck', () => {
    const req = httpMock.createRequest({
      method: 'POST',
      url: '/completeCheck'
    })

    it('returns 200 OK when request processed successfully', () => {
      const res = httpMock.createResponse()
      sut.auth(req, res)
      expect(res.statusCode).toBe(200)
    })

    it('submits valid request to completeCheck service', () => {

    })
  })
})
