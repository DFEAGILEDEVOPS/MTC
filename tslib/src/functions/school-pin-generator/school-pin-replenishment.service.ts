import tz from 'moment-timezone'
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService

  constructor (dataService?: ISchoolPinReplenishmentDataService) {
    if (dataService === undefined) {
      dataService = new SchoolPinReplenishmentDataService()
    }
    this.dataService = dataService
  }

  async process (): Promise<void> {
    const x = await this.dataService.getSchoolData()
    throw new Error(x.toString())
  }
}

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {
  getSchoolData (): Promise<School[]> {
/*     const getSchoolSql = `
    SELECT s.id, s.name,  s.pinExpiresAt, s.pin, sce.id, sce.timezone
    FROM mtc_admin.school s
    LEFT OUTER JOIN mtc_admin.sce ON s.id = sce.school_id` */
    throw new Error('Method not implemented.')
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
  pinExpiresAt?: Date
  pin?: string
  sceId?: number
  timezone?: string
}

export interface SchoolPinUpdate {
  id: number
  newPin: string
  pinExpiresAt: Date
}

export class SchoolPinGenerator {
  generate (): string {
    return 'abc12def'
  }
}

export interface ISchoolRequiresNewPinPredicate {
  (currentPinExpiresAt?: Date, pin?: string): boolean
}

export class UtcOffsetResolver {
  resolveToHours (timezone: string): number {
    const minutesOffset = tz.tz(timezone).utcOffset() // .format('Z')
    return minutesOffset / 60
  }
}
