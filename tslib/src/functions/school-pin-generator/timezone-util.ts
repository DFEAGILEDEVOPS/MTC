import tz from 'moment-timezone'

export class TimezoneUtil {
  resolveToHours (timezone: string): number {
    const minutesOffset = tz.tz(timezone).utcOffset()
    return minutesOffset / 60
  }
}
