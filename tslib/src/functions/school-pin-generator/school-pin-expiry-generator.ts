import moment from 'moment'
import * as tz from 'moment-timezone'
import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { IDateTimeService, DateTimeService } from '../../common/datetime.service'

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
    let localTime: moment.Moment
    if (timezone) {
      localTime = tz.tz(currentUtc, timezone)
    } else {
      localTime = currentUtc
    }
    let expiry = localTime.clone()
    expiry = expiry.startOf('day').hours(16)
    if (localTime.hour() > 15) {
      expiry.add(1, 'days')
    }
    if (this.configProvider.OverridePinExpiry) {
      return expiry.endOf('day')
    }
    return expiry.utc()
  }
}
