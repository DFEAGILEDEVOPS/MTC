const moment = require('moment-timezone')

const pinValidator = require('../../../lib/validator/pin-validator')
const schoolDataService = require('../../../services/data-access/school.data.service')
const pinService = require('../../../services/pin.service')
const schoolMock = require('../mocks/school')
const roles = require('../../../lib/consts/roles')

describe('pin.service', () => {
  describe('getActiveSchool', () => {
    const school = Object.assign({}, schoolMock)
    school.pinExpiresAt = moment().startOf('day').add(16, 'hours')

    describe('if pin is valid', () => {
      beforeEach(() => {
        jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(school)
        jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(true)
      })

      test('it should return school object', async () => {
        const result = await pinService.getActiveSchool(school.id, roles.teacher)
        expect(result.pinExpiresAt).toBeDefined()
        expect(result.pin).toBeDefined()
      })
    })

    describe('if pin is invalid', () => {
      beforeEach(() => {
        jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(school)
        jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(false)
      })

      test('it should return null', async () => {
        const result = await pinService.getActiveSchool(school.id, roles.teacher)
        expect(result).toBeNull()
      })
    })

    describe('generatePinTimestamp', () => {
      describe('when timezone is not supplied', () => {
        test('should return the overridden value if override is enabled', () => {
          setupFakeTime(moment('2021-04-12T12:00:00'))
          const pinTimestamp = pinService.generatePinTimestamp(true)
          expect(pinTimestamp.toISOString()).toStrictEqual('2021-04-12T22:59:59.999Z') // midnight in BST
          tearDownFakeTime()
        })

        test('should return the default value if override is disabled', () => {
          setupFakeTime(moment('2021-04-12T12:00:00'))
          const pinTimestamp = pinService.generatePinTimestamp(false)
          expect(pinTimestamp.toISOString()).toStrictEqual('2021-04-12T15:00:00.000Z') // 4pm BST
          tearDownFakeTime()
        })
      })

      describe('when timezone is supplied', () => {
        test('should return the override value based on the timezone if override is enabled', () => {
          setupFakeTime(moment('2021-04-12T12:00:00Z'))
          const pinTimestamp = pinService.generatePinTimestamp(true, 'Europe/Lisbon')
          expect(pinTimestamp.toISOString()).toStrictEqual('2021-04-12T22:59:59.999Z') // Same as bst
          tearDownFakeTime()
        })

        test('should return the default value based on the timezone if override is disabled', () => {
          setupFakeTime(moment('2021-04-12T12:00:00Z'))
          const pinTimestamp = pinService.generatePinTimestamp(false, 'Europe/Lisbon')
          expect(pinTimestamp.toISOString()).toStrictEqual('2021-04-12T15:00:00.000Z') // Same as bst
          tearDownFakeTime()
        })

        test('pin expiry during BST', () => {
          // Set the base time up to be just after 00:30 (after midnight) on Tues 7 April 2020.  BST is in effect, so
          // this should be 11:30pm on 6th April.
          setupFakeTime(moment('2020-04-06T23:30:00.000Z'))
          const pinTimestamp = pinService.generatePinTimestamp(false, 'Europe/London')
          expect(pinTimestamp.toISOString()).toStrictEqual('2020-04-07T15:00:00.000Z') // 3PM GMT, which is expected
          // when I run this in BST, or 4PM during GMT
          tearDownFakeTime()
        })

        test('pin expiry during GMT', () => {
          // Set the base time up to be just after midnight on Tues 23 Feb 2020. No DST in effect.
          setupFakeTime(moment('2020-12-21T00:30:00.000Z'))
          const pinTimestamp = pinService.generatePinTimestamp(false, 'Europe/London')
          expect(pinTimestamp.toISOString()).toStrictEqual('2020-12-21T16:00:00.000Z')
          tearDownFakeTime()
        })
      })
    })

    test('masks the pins for helpdesk users', async () => {
      const mockSchool = Object.assign({}, schoolMock)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(mockSchool)
      jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(true)
      const school = await pinService.getActiveSchool(mockSchool.id, roles.helpdesk)
      expect(school.pin).toBe('****')
    })

    test('does not mask the pins for teachers', async () => {
      const mockSchool = Object.assign({}, schoolMock)
      jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue(mockSchool)
      jest.spyOn(pinValidator, 'isActivePin').mockReturnValue(true)
      const school = await pinService.getActiveSchool(mockSchool.id, roles.teacher)
      expect(school.pin).toBe('newpin88')
    })
  })

  describe('#generatePinValidFromTimestamp', () => {
    test('returns 8am in GMT', () => {
      setupFakeTime(moment('2020-12-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(false, null)
      expect(dt.toISOString()).toBe('2020-12-01T08:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 8am in BST', () => {
      setupFakeTime(moment('2020-06-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(false, null)
      expect(dt.toISOString()).toBe('2020-06-01T07:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 8am in Australia', () => {
      setupFakeTime(moment('2021-04-12T21:00:00.000')) // AEST is utc+10, so this is 7am on the 13th in Oz
      const dt = pinService.generatePinValidFromTimestamp(false, 'Australia/Sydney')
      expect(dt.toISOString()).toBe('2021-04-12T22:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 8am in BST when given a tz', () => {
      setupFakeTime(moment('2020-06-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(false, 'Europe/London')
      expect(dt.toISOString()).toBe('2020-06-01T07:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 00:00 in GMT with config override ', () => {
      setupFakeTime(moment('2020-12-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(true, null)
      expect(dt.toISOString()).toBe('2020-12-01T00:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 00:00 in GMT with config override and tz', () => {
      setupFakeTime(moment('2020-12-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(true, 'Europe/London')
      expect(dt.toISOString()).toBe('2020-12-01T00:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 00:00 in BST with config override ', () => {
      setupFakeTime(moment('2020-06-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(true, null)
      expect(dt.toISOString()).toBe('2020-05-31T23:00:00.000Z')
      tearDownFakeTime()
    })

    test('returns 00:00 in BST with config override and tz', () => {
      setupFakeTime(moment('2020-06-01T09:30:00.000'))
      const dt = pinService.generatePinValidFromTimestamp(true, 'Europe/London')
      expect(dt.toISOString()).toBe('2020-05-31T23:00:00.000Z')
      tearDownFakeTime()
    })
  })
})

/**
 * @param {moment.Moment} baseTime - set the fake time to this moment object
 *
 */
function setupFakeTime (baseTime) {
  if (!moment.isMoment(baseTime)) {
    throw new Error('moment.Moment time expected')
  }
  jest.useFakeTimers('modern')
  jest.setSystemTime(baseTime.toDate())
}

function tearDownFakeTime () {
  const realTime = jest.getRealSystemTime()
  jest.setSystemTime(realTime)
}
