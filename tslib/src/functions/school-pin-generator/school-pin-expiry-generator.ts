
import * as momentTz from 'moment-timezone'
import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { IDateTimeService, DateTimeService } from '../../common/datetime.service'

export class SchoolPinExpiryGenerator {

  private dateTimeService: IDateTimeService
  private configProvider: IConfigProvider

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

  generate (timezone?: string): momentTz.Moment {
    const currentUtc = this.dateTimeService.utcNow()
    let localTime: momentTz.Moment
    if (timezone) {
      localTime = momentTz.tz(currentUtc, timezone)
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
