import moment from 'moment'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { IDateTimeService } from '../../common/datetime.service'
import { IConfigProvider } from './config-file-provider'

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(),
  convertDateToMoment: jest.fn(),
  convertMomentToJsDate: jest.fn(),
  formatIso8601: jest.fn()
}))

const ConfigProviderMock = jest.fn<IConfigProvider, any>(() => ({
  OverridePinExpiry: jest.fn(),
  AllowedWords: jest.fn()
}))

let sut: SchoolPinExpiryGenerator
let dateTimeServiceMock: IDateTimeService
let configProviderMock: IConfigProvider

describe('school-pin-expiry-generator', () => {
  beforeEach(() => {
    dateTimeServiceMock = new DateTimeServiceMock()
    configProviderMock = new ConfigProviderMock()
    sut = new SchoolPinExpiryGenerator(dateTimeServiceMock, configProviderMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('if current time between 0000 - 1600, set to 1600 same day', () => {
    const timeBefore4pm = moment('2020-02-06 03:55')
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return timeBefore4pm
    })
    const actual = sut.generate()
    expect(actual.toISOString().substring(0, 16)).toEqual('2020-02-06T16:00')
  })

  test('if current time between 1600 - 2359, set to 1600 next day', () => {
    const timeAfter4pm = moment('2020-02-06 16:55')
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return timeAfter4pm
    })
    const actual = sut.generate()
    expect(actual.toISOString().substring(0, 16)).toEqual('2020-02-07T16:00')
  })

  test('if override expiry flag set to true, expire at end of day', () => {
    const endOfDay = moment('2020-02-06').endOf('day').toISOString()
    configProviderMock.OverridePinExpiry = jest.fn(() => {
      return true
    })
    const timeBefore4pm = moment('2020-02-06 03:55')
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return timeBefore4pm
    })
    const actual = sut.generate().toISOString()
    expect(actual).toEqual(endOfDay)
  })

  describe('sce schools', () => {

    test('if current time between 0000 - 1600, set to 1600 same day', () => {
      configProviderMock.OverridePinExpiry = jest.fn(() => {
        return false
      })
      const timeBefore4pm = moment('2020-02-06 03:55')
      dateTimeServiceMock.utcNow = jest.fn(() => {
        return timeBefore4pm
      })
      const timezoneFourHoursAheadOfUtc = 'Asia/Dubai'
      const expected = timeBefore4pm.clone().startOf('day').add(16 - 4, 'hours').toISOString()
      const actual = sut.generate(timezoneFourHoursAheadOfUtc).toISOString()
      expect(actual).toEqual(expected)
    })

    test('if current time between 1600 - 2359, set to 1600 next day', () => {
      const timeAfter4pm = moment('2020-02-06 16:55')
      dateTimeServiceMock.utcNow = jest.fn(() => {
        return timeAfter4pm
      })
      const timezoneFourHoursAheadOfUtc = 'Asia/Dubai'
      const actual = sut.generate(timezoneFourHoursAheadOfUtc)
      expect(actual.toISOString().substring(0, 16)).toEqual('2020-02-07T12:00')
    })

    test('if override expiry flag set to true, expire at end of day', () => {
      configProviderMock.OverridePinExpiry = jest.fn(() => {
        return true
      })
      const timeBefore4pm = moment('2020-02-06 03:55')
      dateTimeServiceMock.utcNow = jest.fn(() => {
        return timeBefore4pm
      })
      const timezoneFourHoursAheadOfUtc = 'Asia/Dubai'
      const expected = moment('2020-02-06').endOf('day').subtract(4, 'hours').toISOString()
      const actual = sut.generate(timezoneFourHoursAheadOfUtc).toISOString()
      expect(actual).toEqual(expected)
    })
  })
})
