import moment from 'moment'
import { School } from './school-pin-replenishment.service'

export class SchoolRequiresNewPinPredicate {
  isRequired (school: School): boolean {
    if (!school.pin) return true
    if (!school.pinExpiresAt) return true
    if (school.pinExpiresAt > moment.utc()) return false
    if (school.pinExpiresAt <= moment.utc()) return true
    return false
  }
}
