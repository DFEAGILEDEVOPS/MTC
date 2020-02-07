import moment from 'moment'

export interface IDateTimeService {
  utcNow (): moment.Moment
}

export class DateTimeService implements IDateTimeService {
  utcNow (): moment.Moment {
    return moment().utc()
  }
}

export class SchoolPinExpiryGenerator {
  dateTimeService: IDateTimeService
  constructor (dateTimeService?: IDateTimeService) {
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
  }
  generate (): moment.Moment {
    const currentTime = this.dateTimeService.utcNow()
    const expiry = moment(currentTime)
    expiry.hour(16)
    expiry.minute(0)
    if (currentTime.hour() > 15) {
      expiry.add(1, 'days')
    }
    return expiry
  }
}

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn()
}))

let sut: SchoolPinExpiryGenerator
let dateTimeServiceMock: IDateTimeService

describe('school-pin-expiry-generator', () => {
  beforeEach(() => {
    dateTimeServiceMock = new DateTimeServiceMock()
    sut = new SchoolPinExpiryGenerator(dateTimeServiceMock)
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
    expect(actual.toISOString().substring(0,16)).toEqual('2020-02-06T16:00')
  })

  test('if current time between 1600 - 2359, set to 1600 next day', () => {
    const timeBefore4pm = moment('2020-02-06 16:55')
    dateTimeServiceMock.utcNow = jest.fn(() => {
      return timeBefore4pm
    })
    const actual = sut.generate()
    expect(actual.toISOString().substring(0,16)).toEqual('2020-02-07T16:00')
  })
})
