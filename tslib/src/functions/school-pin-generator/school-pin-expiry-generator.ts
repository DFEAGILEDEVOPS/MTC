import moment from 'moment'
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

  constructor(dateTimeService?: IDateTimeService, configProvider?: IConfigProvider) {
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider
  }

  generate (): moment.Moment {
    const currentTime = this.dateTimeService.utcNow()
    const expiry = moment(currentTime)
    if (this.configProvider.OverridePinExpiry()) {
      return expiry.endOf('day')
    }
    expiry.hour(16)
    expiry.minute(0)
    if (currentTime.hour() > 15) {
      expiry.add(1, 'days')
    }
    return expiry
  }
}
