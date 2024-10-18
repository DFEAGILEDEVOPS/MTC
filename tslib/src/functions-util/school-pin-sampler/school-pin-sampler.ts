import * as tzutil from '../../functions/school-pin-generator/timezone-util'
import { SchoolPinGenerator } from '../../functions/school-pin-generator/school-pin-generator'
import { SchoolPinExpiryGenerator } from '../../functions/school-pin-generator/school-pin-expiry-generator'
import { type IDateTimeService } from '../../common/datetime.service'
import { RandomGenerator } from '../../functions/school-pin-generator/random-generator'
import type moment from 'moment'

export class SchoolPinSampler {
  generateSample (size: number, utcNow: moment.Moment, allowedWordSet: Set<string>, randomiseSample?: boolean): SchoolPinSample[] {
    const tzUtil = new tzutil.TimezoneUtil()
    const pinGenerator = new SchoolPinGenerator()
    const dateTimeService: IDateTimeService = {
      utcNow: () => utcNow,
      convertDateToMoment: () => { throw new Error('no implementation') },
      convertMomentToJsDate: () => { throw new Error('no implementation') },
      formatIso8601: () => { throw new Error('no implementation') }
    }
    const expiryGenerator = new SchoolPinExpiryGenerator(dateTimeService)
    if (randomiseSample === undefined) randomiseSample = false
    const allZones = tzUtil.getTimezoneList()

    if (size > allZones.length) {
      throw new Error(`maximum sample size is ${allZones.length}`)
    }

    let reducedZoneset: tzutil.Timezone[] = []

    if (randomiseSample) {
      const rangen = new RandomGenerator()
      for (let index = 0; index < size; index++) {
        const randomIndex = rangen.generateNumberFromRangeInclusive(0, allZones.length)
        const randomZone = allZones[randomIndex]
        reducedZoneset.push(randomZone)
      }
    } else {
      reducedZoneset = allZones.splice(0, size)
    }

    function checkNullOrUndefined (o: any): boolean {
      return o === null || o === undefined
    }

    if (reducedZoneset.some(checkNullOrUndefined)) {
      console.error('Invalid reducedZoneset', reducedZoneset)
      throw new Error('reducedZoneset contains some bottom values')
    }

    return reducedZoneset.map((z: tzutil.Timezone) => {
      const upd: SchoolPinSample = {
        pin: pinGenerator.generate(allowedWordSet),
        pinExpiresAt: expiryGenerator.generate(z.zone),
        timezone: z.name
      }
      return upd
    })
  }
}

export interface SchoolPinSample {
  pin: string
  pinExpiresAt: moment.Moment
  timezone: string
}
