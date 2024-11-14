'use strict'
const dateService = require('../../../../services/date.service')
const moment = require('moment')
const pinValidator = require('../../../../lib/validator/pin-validator')

describe('pin-validator', () => {
  let pinExpiredAt

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('isActivePin', () => {
    describe('returns true if the pin is active', () => {
      beforeEach(() => {
        pinExpiredAt = moment().startOf('day')
        jest.spyOn(dateService, 'utcNowAsMoment').mockReturnValue(moment().startOf('day').subtract(1, 'years').valueOf())
      })
      test('if pinExpiredAt date field is later than current time', async () => {
        const result = await pinValidator.isActivePin('abc1f', pinExpiredAt)
        expect(result).toBeTruthy()
      })
    })
    describe('returns false if the pin is inactive', () => {
      beforeEach(() => {
        pinExpiredAt = moment().startOf('day')
        jest.spyOn(dateService, 'utcNowAsMoment').mockReturnValue(moment().startOf('day').add(1, 'years').valueOf())
      })
      test('if pinExpiredAt date field is earlier than current time', async () => {
        const result = await pinValidator.isActivePin('abc1f', pinExpiredAt)
        expect(result).toBeFalsy()
      })
    })
  })
})
