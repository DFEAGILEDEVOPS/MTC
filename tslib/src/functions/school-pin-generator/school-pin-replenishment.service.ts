import tz from 'moment-timezone'
import { SqlService } from '../../sql/sql.service'
import moment from 'moment'
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService
  private newPinRequiredPredicate: SchoolRequiresNewPinPredicate
  private pinGenerator: ISchoolPinGenerator

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
  }

  async process (): Promise<void> {
    const allSchools = await this.dataService.getSchoolData()
    for (let index = 0; index < allSchools.length; index++) {
      const school = allSchools[index]
      if (this.newPinRequiredPredicate.isRequired(school)) {
        let pinUpdated = false
        const update: SchoolPinUpdate = {
          id: school.id,
          pinExpiresAt: moment(), // TODO create expiry generator
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

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {
  private sqlService: SqlService
  constructor () {
    this.sqlService = new SqlService()
  }
  getSchoolData (): Promise<School[]> {
    const sql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.id, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id`
    return this.sqlService.query(sql)
  }

  updatePin (school: SchoolPinUpdate): Promise<void> {
    throw new Error('not implemented')
  }
}

export interface ISchoolPinReplenishmentDataService {
  getSchoolData (): Promise<School[]>
  updatePin (schoolPinUpdate: SchoolPinUpdate): Promise<void>
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

export class SchoolPinGenerator implements ISchoolPinGenerator {
  generate (): string {
    return 'abc12def'
  }
}

export interface ISchoolPinGenerator {
  generate (): string
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
