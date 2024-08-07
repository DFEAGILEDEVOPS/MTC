import type moment from 'moment'
import { SchoolPinReplenishmentDataService, type ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { SchoolPinGenerator, type ISchoolPinGenerator } from './school-pin-generator'
import { SchoolPinExpiryGenerator } from './school-pin-expiry-generator'
import { type ILogger } from '../../common/logger'
import { type IPinConfigProvider, PinConfigProvider } from './pin-config-provider'
import { SchoolRequiresNewPinPredicate } from './school-requires-pin-predicate'
import { MaxAttemptsCalculator } from './max-attempts-calculator'
import { AllowedWordsService, type IAllowedWordsService } from './allowed-words.service'
export class SchoolPinReplenishmnentService {
  private readonly dataService: ISchoolPinReplenishmentDataService
  private readonly newPinRequiredPredicate: SchoolRequiresNewPinPredicate
  private readonly pinGenerator: ISchoolPinGenerator
  private readonly expiryGenerator: SchoolPinExpiryGenerator
  private readonly configProvider: IPinConfigProvider
  private readonly maxAttemptsCalculator: MaxAttemptsCalculator
  private readonly allowedWordsService: IAllowedWordsService
  private readonly logName = 'SchoolPinReplenishmentService'

  constructor (dataService?: ISchoolPinReplenishmentDataService, pinGenerator?: ISchoolPinGenerator,
    configProvider?: IPinConfigProvider, allowedWordsService?: IAllowedWordsService) {
    if (dataService === undefined) {
      dataService = new SchoolPinReplenishmentDataService()
    }
    this.dataService = dataService
    if (pinGenerator === undefined) {
      pinGenerator = new SchoolPinGenerator()
    }
    this.pinGenerator = pinGenerator

    if (configProvider === undefined) {
      configProvider = new PinConfigProvider()
    }

    if (allowedWordsService === undefined) {
      allowedWordsService = new AllowedWordsService()
    }
    this.allowedWordsService = allowedWordsService
    this.configProvider = configProvider
    this.maxAttemptsCalculator = new MaxAttemptsCalculator()
    this.newPinRequiredPredicate = new SchoolRequiresNewPinPredicate()
    this.expiryGenerator = new SchoolPinExpiryGenerator()
  }

  async process (logger: ILogger, schoolId?: number): Promise<string | undefined> {
    let schoolsToProcess: School[]
    let returnGeneratedPin = false
    let pinToReturn = ''
    logger.trace(`${this.logName}: process() called for schoolId [${schoolId}]`)

    if (schoolId === undefined) {
      logger.info(`${this.logName}: generating pins for all schools`)
      schoolsToProcess = await this.dataService.getAllSchools()
    } else {
      returnGeneratedPin = true
      const school = await this.dataService.getSchoolById(schoolId)
      logger.trace(`${this.logName} school found in db ${JSON.stringify(school)}`)
      schoolsToProcess = []
      if (school !== undefined) {
        schoolsToProcess.push(school)
      }
    }
    if (schoolsToProcess.length === 0) {
      logger.info(`${this.logName}: no schools to process, exiting and returning undefined pin`)
      return undefined
    }
    logger.info(`${this.logName}: identified ${schoolsToProcess.length} schools to process...`)
    const allowedWordSet = await this.allowedWordsService.getAllowedWords()
    let maxAttemptsAtSchoolPinUpdate = this.configProvider.PinUpdateMaxAttempts
    if (maxAttemptsAtSchoolPinUpdate === 0) {
      maxAttemptsAtSchoolPinUpdate = this.maxAttemptsCalculator.calculate(allowedWordSet.size, this.configProvider.DigitChars.length)
    }
    for (let index = 0; index < schoolsToProcess.length; index++) {
      const school = schoolsToProcess[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        logger.info(`${this.logName} new pin required for school.id:${school.id}`)
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: this.expiryGenerator.generate(),
          newPin: this.pinGenerator.generate(allowedWordSet),
          attempts: maxAttemptsAtSchoolPinUpdate
        }
        if (returnGeneratedPin) {
          pinToReturn = update.newPin
        }
        let attemptsMade = 0
        while (!pinUpdated && (attemptsMade < update.attempts)) {
          try {
            logger.info(`${this.logName} school update attempt #${attemptsMade + 1} - id:${update.id} expiry:${update.pinExpiresAt.toISOString()} pin:${update.newPin}`)
            await this.dataService.updatePin(update)
            pinUpdated = true
          } catch (error) {
            attemptsMade++
            let errorMessage = 'unknown error'
            if (error instanceof Error) {
              errorMessage = error.message
            }
            logger.error(`${this.logName}: error thrown attempting sql update:${errorMessage}`)
            update.newPin = this.pinGenerator.generate(allowedWordSet)
          }
        }
      }
    }
    if (returnGeneratedPin) return pinToReturn
    return undefined
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
