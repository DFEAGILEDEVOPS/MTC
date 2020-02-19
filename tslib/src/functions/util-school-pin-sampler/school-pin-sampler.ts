import * as tzutil from '../school-pin-generator/timezone-util'
import { SchoolPinGenerator } from '../school-pin-generator/school-pin-generator'
import { SchoolPinExpiryGenerator } from '../school-pin-generator/school-pin-expiry-generator'
import { IDateTimeService } from '../../common/datetime.service'
import moment = require('moment')
import { RandomGenerator } from '../school-pin-generator/random-generator'

export class SchoolPinSampler {
  generateSample (size: number, utcNow: moment.Moment, randomiseSample?: boolean): Array<SchoolPinSample> {
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

    let reducedZoneset: Array<tzutil.Timezone> = []

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

    return reducedZoneset.map((z: tzutil.Timezone) => {
      const upd: SchoolPinSample = {
        pin: pinGenerator.generate(),
        pinExpiresAt: expiryGenerator.generate(),
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
