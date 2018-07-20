'use strict'
/* global describe, it, expect, beforeEach, afterEach */
const sinon = require('sinon')
const moment = require('moment')
const pinValidator = require('../../../../lib/validator/pin-validator')

describe('pin-validator', () => {
  let pinExpiredAt
  describe('isActivePin', () => {
    let sandbox
    beforeEach(() => { sandbox = sinon.sandbox.create() })
    afterEach(() => sandbox.restore())
    describe('returns true if the pin is active', () => {
      beforeEach(() => {
        pinExpiredAt = moment().startOf('day')
        sandbox.useFakeTimers(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      it('if pinExpiredAt date field is later than current time', async () => {
        const result = await pinValidator.isActivePin('abc1f', pinExpiredAt)
        expect(result).toBeTruthy()
      })
    })
    describe('returns false if the pin is inactive', () => {
      beforeEach(() => {
        pinExpiredAt = moment().startOf('day')
        sandbox.useFakeTimers(moment().startOf('day').add(1, 'years').valueOf())
      })
      it('if pinExpiredAt date field is earlier than current time', async () => {
        const result = await pinValidator.isActivePin('abc1f', pinExpiredAt)
        expect(result).toBeFalsy()
      })
    })
  })
})
