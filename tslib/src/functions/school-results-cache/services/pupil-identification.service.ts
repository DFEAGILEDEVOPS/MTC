import moment from 'moment'
import * as R from 'ramda'
import { type IPupilResult } from './result.service'

/**
 * Utility function to format a date to the short GDS date format
 * https://www.gov.uk/guidance/style-guide/a-to-z-of-gov-uk-style
 */
function formatShortGdsDate (date: Date | moment.Moment): string {
  const gdsShortFormat = 'D MMM YYYY'
  if (!(date instanceof Date || moment.isMoment(date))) {
    return ''
  }
  const m = moment(date)
  if (!m.isValid()) {
    return ''
  }
  return m.format(gdsShortFormat)
}

export interface IPupilIdentificationService {
  addIdentificationFlags (pupils: IPupilResult[]): IdentifiedPupilResult[]
}

interface InternalIdentifiedPupilType extends IPupilResult {
  // determine if the GUI should show the middle names for pupil disambiguation
  showMiddleNames: boolean
  // determine if the GUI should show the formatted date of birth for pupil disambiguation
  showDoB: boolean
  // the original implementation override the dateOfBirth with a string, here we create a new property
  formattedDateOfBirth: string
  // surname, forename [middle names]
  fullName: string
  // used to preserve the sort order
  sortOrder: number
}

/**
 * This would be better if it extended IPupilResult, but the dateOfBirth is incompatible (string instead of Moment)
 */
export interface IdentifiedPupilResult {
  dateOfBirth: string
  foreName: string
  fullName: string
  group_id: null | number
  lastName: string
  middleNames: string
  score: null | number
  showDoB: boolean
  showMiddleNames: boolean
  status: string
  urlSlug: string
}

export class PupilIdentificationService implements IPupilIdentificationService {
  /**
   * Adds show Date of Birth flag for pupils that have been alphabetically sorted by last name and have equal full names
   * @param {foreName: string, lastName: string, fullName: string, dateOfBirth: moment.Moment} pupils
   * @returns {Array}
   */
  addIdentificationFlags (pupils: IPupilResult[]): IdentifiedPupilResult[] {
    const unidentifiedPupils: InternalIdentifiedPupilType[] = pupils.map((pupil, i) => {
      return R.mergeLeft(pupil, {
        showDoB: false,
        showMiddleNames: false,
        formattedDateOfBirth: formatShortGdsDate(pupil.dateOfBirth),
        fullName: `${pupil.lastName}, ${pupil.foreName}`,
        sortOrder: i
      })
    })

    // Find out which names have multiple pupils, by grouping them under a 'surname, forename' key.
    const getFullName = (o: InternalIdentifiedPupilType): string => `${o.lastName}, ${o.foreName}`
    const groupByFullName = R.groupBy(getFullName)
    const grouped = groupByFullName(unidentifiedPupils)

    const momentComparator = (a: moment.Moment, b: moment.Moment): boolean => a.valueOf() === b.valueOf()

    // Apply identification rules to pupils that have the same name
    R.keys(grouped).forEach(k => {
      if (grouped[k].length > 1) {
        // Use date of birth to differentiate, if all birth dates are unique
        const dobs: moment.Moment[] = grouped[k].map(o => o.dateOfBirth)
        const uniqueDobs = R.uniqWith(momentComparator, dobs)
        if (uniqueDobs.length === dobs.length) {
          // all the birth dates are unique, we can differentiate on them
          grouped[k].forEach(o => {
            o.showDoB = true
          })
        } else {
          // Fallback to differentiating via middle name
          grouped[k].forEach(o => {
            o.showMiddleNames = true
            o.fullName = `${o.lastName}, ${o.foreName} ${o.middleNames}`
          })
        }
      }
    })

    // Reconstruct the pupil objects into a list
    const internalIdentifiedPupils = R.chain(k => grouped[k], R.keys(grouped))

    // sort back into original order
    const sorted = R.sortBy(R.prop('sortOrder'), internalIdentifiedPupils)

    // map back into the output format
    return sorted.map(o => {
      return {
        dateOfBirth: o.formattedDateOfBirth,
        foreName: o.foreName,
        fullName: o.fullName,
        group_id: o.group_id,
        lastName: o.lastName,
        middleNames: o.middleNames,
        score: o.score,
        showDoB: o.showDoB,
        showMiddleNames: o.showMiddleNames,
        status: o.status,
        urlSlug: o.urlSlug
      }
    })
  }
}

export default new PupilIdentificationService()
