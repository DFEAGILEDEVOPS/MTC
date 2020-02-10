import tz from 'moment-timezone'
import moment from 'moment'
import { SchoolPinReplenishmentDataService, ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { SchoolPinGenerator, ISchoolPinGenerator } from './school-pin-generator'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService
  private newPinRequiredPredicate: SchoolRequiresNewPinPredicate
  private pinGenerator: ISchoolPinGenerator
  private expiryGenerator: SchoolPinExpiryGenerator

  constructor (dataService?: ISchoolPinReplenishmentDataService, pinGenerator?: ISchoolPinGenerator) {
    if (dataService === undefined) {
      dataService = new SchoolPinReplenishmentDataService()
    }
    this.dataService = dataService
    if (pinGenerator === undefined) {
      pinGenerator = new SchoolPinGenerator()
    }
    this.pinGenerator = pinGenerator
    this.newPinRequiredPredicate = new SchoolRequiresNewPinPredicate()
    this.expiryGenerator = new SchoolPinExpiryGenerator()
  }

  async process (): Promise<void> {
    const allSchools = await this.dataService.getSchoolData()
    for (let index = 0; index < allSchools.length; index++) {
      const school = allSchools[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: this.expiryGenerator.generate(),
          newPin: this.pinGenerator.generate()
        }
        while (!pinUpdated) {
          try {
            await this.dataService.updatePin(update)
            pinUpdated = true
          } catch (error) {
            update.newPin = this.pinGenerator.generate()
          }
        }
      }
    }
  }
}

export interface School {
  id: number
  name: string
  pinExpiresAt?: moment.Moment
  pin?: string
  sceId?: number
  timezone?: string
}

export interface SchoolPinUpdate {
  id: number
  newPin: string
  pinExpiresAt: moment.Moment
}

export class SchoolRequiresNewPinPredicate {
  isRequired (school: School): boolean {
    if (!school.pin) return true
    if (!school.pinExpiresAt) return true
    if (school.pinExpiresAt > moment.utc()) return false
    if (school.pinExpiresAt <= moment.utc()) return true
    return false
  }
}

export class UtcOffsetResolver {
  resolveToHours (timezone: string): number {
    const minutesOffset = tz.tz(timezone).utcOffset() // .format('Z')
    return minutesOffset / 60
  }
}
