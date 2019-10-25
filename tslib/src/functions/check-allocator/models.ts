import { Moment } from 'moment'

export interface IPupil {
  id: number
}
export interface IPupilAllocation {
  id: number
  pin?: number
  allocatedForm?: any
  allocatedAtUtc: Moment
}
export interface ISchoolAllocation {
  schoolUUID: string
  pupils: Array<IPupil>
  lastReplenishmentUtc: Moment
}
