import { ReportLine } from './report-line.class'
import { pupil as pupilCompletedCheck } from './mocks/pupil-who-completed-a-check'
import { pupil as pupilNotAttending } from './mocks/pupil-not-attending'
import { school } from './mocks/school'
// import { answers } from './mocks/answers'
// import { check } from './mocks/check'

describe('report line class', () => {
  // See Psychometric Report Data Sourcing for a clearer view of the data sources and groupings.
  describe('pupil information (taking check)', () => {
    let sut: ReportLine

    beforeEach(() => {
      sut = new ReportLine(
        null,
        null,
        null,
        null,
        null,
        null,
        pupilCompletedCheck,
        school
      )
    })

    test('it is defined', () => {
      expect(sut).toBeDefined()
    })

    test('it outputs the pupil DOB in uk format', () => {
      const out = sut.transform()
      expect(out).toHaveProperty('DOB')
      expect(out.DOB).toBe('07/03/2012')
    })

    test('it outputs the pupil gender in uppercase', () => {
      const out = sut.transform()
      expect(out.Gender).toBe('F')
    })

    test('it outputs the pupil ID', () => {
      const out = sut.transform()
      expect(out.PupilID).toBe('TEST987')
    })

    test('it outputs the pupil forename', () => {
      const out = sut.transform()
      expect(out.Forename).toBe('test')
    })

    test('it outputs the pupil Surname', () => {
      const out = sut.transform()
      expect(out.Surname).toBe('data')
    })

    test('if the pupil has taken a check it should have a null ReasonForTakingCheck', () => {
      const out = sut.transform()
      expect(out.ReasonNotTakingCheck).toBeNull()
    })
  })

  describe('pupil information (not attending check)', () => {
    let sut: ReportLine

    beforeEach(() => {
      sut = new ReportLine(
        null,
        null,
        null,
        null,
        null,
        null,
        pupilNotAttending,
        school
      )
    })

    test('it is defined', () => {
      expect(sut).toBeDefined()
    })

    test('it has a reason for not taking the check', () => {
      const out = sut.transform()
      expect(out.ReasonNotTakingCheck).toBe(1)
    })
  })

  // Add tests for construction setters and getters
})
