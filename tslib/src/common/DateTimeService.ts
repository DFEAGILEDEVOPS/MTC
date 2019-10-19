import moment = require('moment')

export interface IDateTimeService {
  utcNow (): moment.Moment
}
export class DateTimeService implements IDateTimeService {
  utcNow (): moment.Moment {
    return moment.utc()
  }
}
