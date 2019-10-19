import moment = require('moment')

export interface IDateTimeService {
  utcNow (): Date;
}
export class DateTimeService implements IDateTimeService {
  utcNow (): Date {
    return moment.utc().toDate()
  }
}
