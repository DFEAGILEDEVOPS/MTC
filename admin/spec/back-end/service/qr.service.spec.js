'use strict'
/* global describe, test, expect */

const qrService = require('../../../services/qr.service')
const qrUrl = require('../mocks/qr-url')

describe('qr.service', () => {
  describe('getDataURL', () => {
    test('returns a data url when config url parameter is defined', async () => {
      const dataURL = await qrService.getDataURL('https://www.google.co.uk')
      expect(dataURL).toBe(qrUrl)
    })
    test('returns null when url parameter is not defined', async () => {
      const dataURL = await qrService.getDataURL('')
      expect(dataURL).toBeNull()
    })
  })
})
