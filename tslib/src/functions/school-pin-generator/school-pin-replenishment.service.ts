import moment from 'moment'
import { SchoolPinReplenishmentDataService, ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { SchoolPinGenerator, ISchoolPinGenerator } from './school-pin-generator'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { ILogger } from '../../common/logger'
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

  async process (logger: ILogger): Promise<void> {
    const allSchools = await this.dataService.getSchoolData()
    logger.info(`identified ${allSchools.length} schools to process...`)
    for (let index = 0; index < allSchools.length; index++) {
      const school = allSchools[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        logger.info(`new pin required for school.id:${school.id}`)
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: this.expiryGenerator.generate(),
          newPin: this.pinGenerator.generate(),
          attempts: 5
        }
        let attemptsMade = 0
        while (!pinUpdated && (attemptsMade < update.attempts)) {
          try {
            logger.info(`school update attempt #${attemptsMade + 1} - id:${update.id} expiry:${update.pinExpiresAt} pin:${update.newPin}`)
            await this.dataService.updatePin(update)
            pinUpdated = true
          } catch (error) {
            attemptsMade++
            logger.error(`error thrown attempting sql update:${error.message}`)
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
  attempts: number
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


