import moment = require('moment')
import { Moment } from 'moment'

const iso8601WithMsPrecisionAndTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

export interface IDateTimeService {
  utcNow (): moment.Moment
  formatIso8601 (date: Moment): string
}
export class DateTimeService implements IDateTimeService {

  utcNow (): moment.Moment {
    return moment.utc()
  }

  formatIso8601 (date: Moment): string {
    if (!moment.isMoment(date)) {
      throw new Error('Parameter must be of type Moment')
    }
    if (!date.isValid()) {
      throw new Error('Not a valid date')
    }
    return date.format(iso8601WithMsPrecisionAndTimeZone)
  }
}
