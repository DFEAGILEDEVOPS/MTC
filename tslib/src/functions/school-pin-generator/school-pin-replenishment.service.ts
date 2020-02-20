import moment from 'moment'
import { SchoolPinReplenishmentDataService, ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { SchoolPinGenerator, ISchoolPinGenerator } from './school-pin-generator'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { ILogger } from '../../common/logger'
import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { SchoolRequiresNewPinPredicate } from './school-requires-pin-predicate'
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService
  private newPinRequiredPredicate: SchoolRequiresNewPinPredicate
  private pinGenerator: ISchoolPinGenerator
  private expiryGenerator: SchoolPinExpiryGenerator
  private configProvider: IConfigProvider

  constructor (dataService?: ISchoolPinReplenishmentDataService, pinGenerator?: ISchoolPinGenerator,
    configProvider?: IConfigProvider) {
    if (dataService === undefined) {
      dataService = new SchoolPinReplenishmentDataService()
    }
    this.dataService = dataService
    if (pinGenerator === undefined) {
      pinGenerator = new SchoolPinGenerator()
    }
    this.pinGenerator = pinGenerator

    if (configProvider === undefined) {
      configProvider = new ConfigFileProvider()
    }
    this.configProvider = configProvider

    this.newPinRequiredPredicate = new SchoolRequiresNewPinPredicate()
    this.expiryGenerator = new SchoolPinExpiryGenerator()
  }

  async process (logger: ILogger, schoolUUID?: string): Promise<void> {
    let schoolsToProcess: Array<School>
    if (schoolUUID === undefined) {
      schoolsToProcess = await this.dataService.getAllSchools()
    } else {
      const school = await this.dataService.getSchoolByUuid(schoolUUID)
      schoolsToProcess = []
      if (school !== undefined) {
        schoolsToProcess.push(school)
      }
    }
    if (schoolsToProcess.length === 0) {
      logger.info('no schools to process, exiting...')
      return
    }
    logger.info(`identified ${schoolsToProcess.length} schools to process...`)
    for (let index = 0; index < schoolsToProcess.length; index++) {
      const school = schoolsToProcess[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        logger.info(`new pin required for school.id:${school.id}`)
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: this.expiryGenerator.generate(),
          newPin: this.pinGenerator.generate(),
          attempts: this.configProvider.PinUpdateMaxAttempts
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
  timezone?: string
}

export interface SchoolPinUpdate {
  id: number
  newPin: string
  pinExpiresAt: moment.Moment
  attempts: number
}
