'use strict'

/* global describe spyOn */

import { default as authController } from '../../controllers/auth.controller'
import * as httpMocks from 'node-mocks-http'
import * as winston from 'winston'
import { pupilAuthenticationService } from '../../services/pupil-authentication.service'

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

    it('makes a call to the authentication service', async () => {
      spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve())
      req.body = { schoolPin: 'pin1', pupilPin: 'pin2' }
      await authController.postAuth(req, res)
      expect(pupilAuthenticationService.authenticate).toHaveBeenCalledWith('pin2', 'pin1')
    })

    it('returns unauthorised if the login failed', async () => {
      spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.reject(new Error('mock error')))
      spyOn(winston, 'error')
      req.body = { schoolPin: 'pin1', pupilPin: 'pin2' }
      await authController.postAuth(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(401)
      expect(data.error).toBe('Unauthorised')
    })

    it('returns a data packet to the client if authorisation is successful', async () => {
      spyOn(pupilAuthenticationService, 'authenticate').and.returnValue(Promise.resolve({}))
      await authController.postAuth(req, res)
      const data = JSON.parse(res._getData())
      expect(res.statusCode).toBe(200)
      expect(data).toBeTruthy()
    })
  })
})
