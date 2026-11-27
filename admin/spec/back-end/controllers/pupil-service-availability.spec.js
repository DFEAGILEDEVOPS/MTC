'use strict'

const express = require('express')
const request = require('supertest')
const emergencyOffSwitchService = require('../../../services/emergency-off-switch.service')
const getPupilServiceAvailability = require('../../../controllers/pupil-service-availability')
const logger = require('../../../services/log.service').getLogger()

describe('pupil service availability', () => {
  const app = express()
  app.get('/pupil-service-availability', getPupilServiceAvailability)

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test.each([false, true])('returns only the current switch flag without requiring authentication (enabled: %s)', async (isEnabled) => {
    jest.spyOn(emergencyOffSwitchService, 'get').mockResolvedValue({
      isEnabled,
      updatedAt: new Date(),
      updatedBy_userId: 1
    })

    const response = await request(app)
      .get('/pupil-service-availability')
      .set('Origin', 'https://pupil.example.com')
      .expect(200)

    expect(response.body).toEqual({ isEnabled })
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.headers['access-control-allow-origin']).toBe('*')
    expect(response.headers['access-control-allow-credentials']).toBeUndefined()
    expect(response.headers['set-cookie']).toBeUndefined()
  })

  test.each([
    new Error('Database unavailable'),
    undefined
  ])('returns a service error rather than defaulting to off if the state cannot be read (%s)', async (error) => {
    const getState = jest.spyOn(emergencyOffSwitchService, 'get')
    if (error) {
      getState.mockRejectedValue(error)
    } else {
      getState.mockResolvedValue({ isEnabled: null })
    }
    jest.spyOn(logger, 'error').mockImplementation()

    const response = await request(app).get('/pupil-service-availability').expect(503)

    expect(response.body).toEqual({ error: 'Unable to check service availability' })
    expect(response.headers['cache-control']).toBe('no-store')
    expect(response.headers['access-control-allow-origin']).toBe('*')
    expect(logger.error).toHaveBeenCalledWith('Failed to check pupil service availability', expect.any(Error))
  })
})
