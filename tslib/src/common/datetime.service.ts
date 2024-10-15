import moment, { type Moment } from 'moment'

const iso8601WithMsPrecisionAndTimeZone = 'YYYY-MM-DDTHH:mm:ss.SSSZ'

export interface IDateTimeService {
  utcNow (): moment.Moment
  formatIso8601 (date: Moment): string
  convertDateToMoment (d: Date | Moment): Moment
  convertMomentToJsDate (m: Moment): Date
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

  /**
   * Convert Date to Moment object
   * Useful for converting Data during sql UPDATES and INSERTS
   */
  convertDateToMoment (d: Date | Moment): Moment {
    if (d instanceof Date && moment(d, moment.ISO_8601).isValid()) {
      return moment.utc(d)
    }
    return d as Moment
  }

  /**
   * Given an object will convert all Moment values to Javascript Date
   * Useful for converting Data during sql UPDATES and INSERTS
   */
  convertMomentToJsDate (m: Moment): Date {
    if (!moment.isMoment(m)) {
      return m as Date
    }
    const iso = this.formatIso8601(m)
    return new Date(iso)
  }
}
