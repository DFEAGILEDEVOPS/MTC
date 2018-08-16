'use strict'

/* global describe spyOn */

import { default as authController } from '../../controllers/auth.controller'
import * as httpMocks from 'node-mocks-http'
import * as winston from 'winston'

describe('auth controller', () => {
  describe('route /auth', () => {
    let req
    let res

    beforeEach(() => {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/auth',
        headers: {
          'Content-type': 'application/json'
        }
      })
      res = httpMocks.createResponse()
    })

    it('returns an 400 error if the request is not JSON', async () => {
      req = httpMocks.createRequest({
        method: 'POST',
        url: '/auth',
        headers: {
          'Content-type': 'text/html' // error here - should be application/json
        }
      })
      spyOn(winston, 'error')
      await authController.postAuth(req, res)
      expect(res.statusCode).toBe(400)
      const data = JSON.parse(res._getData())
      expect(data.error).toBe('Bad request')
    })
  })

  it('returns an error if the pupil pin is not provided', () => {

  })
})
