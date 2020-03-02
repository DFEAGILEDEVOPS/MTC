import moment from 'moment'
import { SchoolPinReplenishmentDataService, ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { SchoolPinGenerator, ISchoolPinGenerator } from './school-pin-generator'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { ILogger } from '../../common/logger'
import { IConfigProvider, ConfigFileProvider } from './config-file-provider'
import { SchoolRequiresNewPinPredicate } from './school-requires-pin-predicate'
import { MaxAttemptsCalculator } from './max-attemps-calculator.spec'
import { AllowedWordsService } from './allowed-words.service'
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService
  private newPinRequiredPredicate: SchoolRequiresNewPinPredicate
  private pinGenerator: ISchoolPinGenerator
  private expiryGenerator: SchoolPinExpiryGenerator
  private configProvider: IConfigProvider
  private maxAttemptsCalculator: MaxAttemptsCalculator
  private allowedWordsService: AllowedWordsService

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
    this.maxAttemptsCalculator = new MaxAttemptsCalculator()
    this.newPinRequiredPredicate = new SchoolRequiresNewPinPredicate()
    this.expiryGenerator = new SchoolPinExpiryGenerator()
    this.allowedWordsService = new AllowedWordsService()
  }

  async process (logger: ILogger, schoolUUID?: string): Promise<void | string> {
    let schoolsToProcess: Array<School>
    let returnGeneratedPin: boolean = false
    let pinToReturn: string = ''
    if (schoolUUID === undefined) {
      schoolsToProcess = await this.dataService.getAllSchools()
    } else {
      returnGeneratedPin = true
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
    const allowedWords = this.allowedWordsService.parse(this.configProvider.AllowedWords, this.configProvider.BannedWords)
    let maxAttemptsAtSchoolPinUpdate = this.configProvider.PinUpdateMaxAttempts
    if (maxAttemptsAtSchoolPinUpdate === 0) {
      maxAttemptsAtSchoolPinUpdate = this.maxAttemptsCalculator.calculate(allowedWords.size, this.configProvider.DigitChars.length)
    }
    for (let index = 0; index < schoolsToProcess.length; index++) {
      const school = schoolsToProcess[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        logger.info(`new pin required for school.id:${school.id}`)
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: this.expiryGenerator.generate(),
          newPin: this.pinGenerator.generate(),
          attempts: maxAttemptsAtSchoolPinUpdate
        }
        if (returnGeneratedPin === true) {
          pinToReturn = update.newPin
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
    if (returnGeneratedPin) return pinToReturn
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
