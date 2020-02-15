import * as csv from 'fast-csv'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { IDateTimeService } from '../../common/datetime.service'
import { IConfigProvider } from './config-file-provider'
import * as tzMetaData from 'moment-timezone/data/meta/latest.json'
import moment from 'moment'

let sut: SchoolPinExpiryGenerator
let dateTimeService: IDateTimeService

const configProvider: IConfigProvider = {
  AllowedWords: '',
  BannedWords: '',
  OverridePinExpiry: false
}

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(),
  convertDateToMoment: jest.fn(),
  convertMomentToJsDate: jest.fn(),
  formatIso8601: jest.fn()
}))

function getTimezoneList (): Array<any> {
  const countryZonesCache: Array<any> = []

  if (countryZonesCache.length > 0) return countryZonesCache

  const getOffset = (zone: string) => {
    return moment().tz(zone).format('Z')
  }

  Object.values(tzMetaData.countries).forEach(val => {
    if (val.zones.length > 1) {
      val.zones.forEach(z => {
        const lastElement = z.split('/').pop()
        let zoneName
        if (lastElement) {
          zoneName = lastElement.replace('_', ' ')
          countryZonesCache.push({ name: `${val.name}, ${zoneName} (GMT ${getOffset(z)})`, zone: z, countryCode: val.abbr })
        }
      })
    } else {
      const z = val.zones[0]
      countryZonesCache.push({ name: `${val.name} (GMT ${getOffset(z)})`, zone: z, countryCode: val.abbr })
    }
  })
  return countryZonesCache

}

describe.only('create csv', () => {
  beforeEach(() => {
    dateTimeService = new DateTimeServiceMock()
    sut = new SchoolPinExpiryGenerator(dateTimeService, configProvider)
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinExpiryGenerator)
  })

  test('generate expiry time matrix', () => {
    const stream = csv.format({ headers: true })
    stream.pipe(process.stdout)
    const zones = getTimezoneList().slice(0, 20)
    const hours: Array<string> = ['Timezone']
    for (let hour = 0; hour < 24; hour++) {
      hours.push(`${hour}:00`)

    }
    stream.write(hours)
    for (let index = 0; index < zones.length; index++) {
      const tz = zones[index]
      const baseDate = moment('2020-02-14').startOf('day')
      const row: Array<string> = [tz.name]
      for (let hour = 0; hour < 24; hour++) {
        dateTimeService.utcNow = jest.fn(() => baseDate.hour(hour))
        const expiryTime = sut.generate(tz.zone)
        row.push(expiryTime.toISOString())
      }
      stream.write(row)
    }
    stream.end()
  })
})
