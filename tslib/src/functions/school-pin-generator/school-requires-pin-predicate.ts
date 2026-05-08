import moment from 'moment'
import { type School } from './school-pin-replenishment.service'

export class SchoolRequiresNewPinPredicate {
  isRequired (school: School): boolean {
    if (school.pin === undefined) return true
    if (school.pinExpiresAt === undefined) return true
    if (school.pinExpiresAt > moment.utc()) return false
    if (school.pinExpiresAt <= moment.utc()) return true
    return false
  }
}
