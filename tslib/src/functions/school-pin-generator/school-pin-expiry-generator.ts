import * as momentTz from 'moment-timezone'
import { PinConfigProvider } from './pin-config-provider'
import { type IConfigProvider } from './config-provider'
import { type IDateTimeService, DateTimeService } from '../../common/datetime.service'

export class SchoolPinExpiryGenerator {
  private readonly dateTimeService: IDateTimeService
  private readonly configProvider: IConfigProvider

  constructor (dateTimeService?: IDateTimeService, configProvider?: IConfigProvider) {
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
    if (configProvider === undefined) {
      configProvider = new PinConfigProvider()
    }
    this.configProvider = configProvider
  }

  generate (timezone?: string): momentTz.Moment {
    const currentUtc = this.dateTimeService.utcNow()
    let localTime: momentTz.Moment
    if (timezone !== undefined) {
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
