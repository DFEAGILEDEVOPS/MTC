import tz from 'moment-timezone'
import * as moment from 'moment'
import * as tzMetaData from 'moment-timezone/data/meta/latest.json'

export interface Timezone {
  name: string
  zone: string
  countryCode: string
}
export class TimezoneUtil {
  resolveToHours (timezone: string): number {
    const minutesOffset = tz.tz(timezone).utcOffset()
    return minutesOffset / 60
  }

  getTimezoneList (): Array<Timezone> {
    const countryZonesCache: Array<Timezone> = []

    if (countryZonesCache.length > 0) return countryZonesCache

    const getOffset = (zone: string) => {
      return moment.tz(zone).format('Z')
    }

    Object.values(tzMetaData.countries).forEach(val => {
      if (val.zones.length > 1) {
        val.zones.forEach(z => {
          const lastElement = z.split('/').pop()
          let zoneName
          if (lastElement) {
            zoneName = lastElement.replace('_', ' ')
            countryZonesCache.push({ name: `${val.name}, ${zoneName} (GMT ${getOffset(z)})`, zone: z, countryCode: val.abbr })
          }
        })
      } else {
        const z = val.zones[0]
        countryZonesCache.push({ name: `${val.name} (GMT ${getOffset(z)})`, zone: z, countryCode: val.abbr })
      }
    })
    return countryZonesCache
  }
}
