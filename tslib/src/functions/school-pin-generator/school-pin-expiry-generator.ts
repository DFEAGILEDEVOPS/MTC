import moment from 'moment'
import * as tz from 'moment-timezone'
import config from '../../config'

export interface IDateTimeService {
  utcNow (): moment.Moment
}

export class DateTimeService implements IDateTimeService {
  utcNow (): moment.Moment {
    return moment().utc()
  }
}

export interface IConfigProvider {
  OverridePinExpiry (): boolean
}

export class ConfigFileProvider implements IConfigProvider {
  OverridePinExpiry (): boolean {
    return config.SchoolPinGenerator.OverridePinExpiry
  }
}

export class SchoolPinExpiryGenerator {

  dateTimeService: IDateTimeService
  configProvider: IConfigProvider

  constructor (dateTimeService?: IDateTimeService, configProvider?: IConfigProvider) {
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider
  }

  generate (timezone?: string): moment.Moment {
    const currentUtc = this.dateTimeService.utcNow()
    console.log(`timezone:${timezone}`)
    console.log(`utcNow:${currentUtc}`)
    let localTime: moment.Moment
    if (timezone) {
      localTime = tz.tz(currentUtc, timezone)
    } else {
      localTime = currentUtc
    }
    console.log(`localTime:${localTime}`)
    let expiry = localTime.clone()
    expiry = expiry.startOf('day').hours(16)
    if (localTime.hour() > 15) {
      expiry.add(1, 'days')
    }
    if (this.configProvider.OverridePinExpiry()) {
      console.log(`overriding pin expiry and returning end of day`)
      return expiry.endOf('day')
    }
    console.log(`expiry.utc:${expiry.utc()}`)
    return expiry.utc()
  }
}
