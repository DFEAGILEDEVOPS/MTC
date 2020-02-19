import { TimezoneUtil } from '../school-pin-generator/timezone-util'

import { SchoolPinGenerator } from '../school-pin-generator/school-pin-generator'
import { SchoolPinExpiryGenerator } from '../school-pin-generator/school-pin-expiry-generator'
import { IDateTimeService } from '../../common/datetime.service'
import moment = require('moment')

export class SchoolPinSampler {
  generateSample (size: number, utcNow: moment.Moment): Array<SchoolPinSample> {
    const tzUtil = new TimezoneUtil()
    const pinGenerator = new SchoolPinGenerator()
    const dateTimeService: IDateTimeService = {
      utcNow: () => utcNow,
      convertDateToMoment: () => { throw new Error('no implementation') },
      convertMomentToJsDate: () => { throw new Error('no implementation') },
      formatIso8601: () => { throw new Error('no implementation') }
    }
    const expiryGenerator = new SchoolPinExpiryGenerator(dateTimeService)

    const zones = tzUtil.getTimezoneList().splice(0, size)
    return zones.map(z => {
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
