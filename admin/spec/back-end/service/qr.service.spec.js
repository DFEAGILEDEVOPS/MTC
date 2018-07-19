'use strict'
/* global describe, it, expect */

const qrService = require('../../../services/qr.service')
const qrUrl = require('../mocks/qr-url')

describe('qr.service', () => {
  describe('getDataURL', () => {
    it('returns a data url when config url parameter is defined', async () => {
      const dataURL = await qrService.getDataURL('https://www.google.co.uk')
      expect(dataURL).toBe(qrUrl)
    })
    it('returns null when url parameter is not defined', async () => {
      const dataURL = await qrService.getDataURL('')
      expect(dataURL).toBeNull()
    })
  })
})
