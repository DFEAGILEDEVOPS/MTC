import { IEstablishment } from './IEstablishment'
import predicates from './school-predicates'

export interface IEstablishmentFilter {
  byTypeAndAgeRange (establishments: Array<IEstablishment>): Array<IEstablishment>
}

export class MtcEstablishmentFilter implements IEstablishmentFilter {
  byTypeAndAgeRange (establishments: Array<IEstablishment>): Array<IEstablishment> {
    return establishments.filter(this.isRelevantTypeAndAgeRange, this)
  }

  private isRelevantTypeAndAgeRange (school: IEstablishment): boolean {
    const targetAge = 9
    return predicates.isRequiredEstablishmentTypeGroup(school) &&
      predicates.isAgeInRange(targetAge, school)
  }
}
