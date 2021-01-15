import { ReportLine } from './report-line.class'
import { pupil as pupilCompletedCheck } from './mocks/pupil-who-completed-a-check'
import { pupil as pupilNotAttending } from './mocks/pupil-not-attending'
import { school } from './mocks/school'
import { answers } from './mocks/answers'
import { check } from './mocks/check'
import { checkConfig } from './mocks/check-config'
import { checkForm } from './mocks/check-form'
import { device } from './mocks/device'
import { events } from './mocks/events'

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

  describe('constructor', () => {
    test('it stores the answers', () => {
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school)
      expect(sut.answers).toBe(answers)
    })

    test('the answers are readonly', () => {
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school)
      // the compiler prevents re-assignment
      // sut.answers = {}

      // What about modification?
      if (Array.isArray(sut.answers) && sut.answers.length > 1) {
        try {
          sut.answers[1].isCorrect = true // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.answers[1].isCorrect).toBe(false)
      }
    })

    test('the inputs are readonly', () => {
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school)
      // What about modification?
      if (Array.isArray(sut.answers) && sut.answers.length > 1) {
        try {
          sut.answers[1].inputs[0].input = '66' // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.answers[1].inputs[0].input).toBe('2')
      }
    })

    test('it stores the check', () => {
      const sut = new ReportLine(null, check, null, null, null, null, pupilCompletedCheck, school)
      expect(sut.check).toBe(check)
    })

    test('the check is readonly', () => {
      const sut = new ReportLine(null, check, null, null, null, null, pupilCompletedCheck, school)
      if (sut.check !== null) {
        try {
          sut.check.mark = 26 // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.check.mark).toBe(1)
      }
    })

    test('it stores the checkConfig', () => {
      const sut = new ReportLine(null, null, checkConfig, null, null, null, pupilCompletedCheck, school)
      expect(sut.checkConfig).toBe(checkConfig)
    })

    test('the checkConfig is readonly', () => {
      const sut = new ReportLine(null, null, checkConfig, null, null, null, pupilCompletedCheck, school)
      if (sut.checkConfig !== null) {
        try {
          sut.checkConfig.audibleSounds = true // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.checkConfig.audibleSounds).toBe(false)
      }
    })

    test('it stores the checkForm', () => {
      const sut = new ReportLine(null, null, null, checkForm, null, null, pupilCompletedCheck, school)
      expect(sut.checkForm).toBe(checkForm)
    })

    test('the checkForm is readonly', () => {
      const sut = new ReportLine(null, null, null, checkForm, null, null, pupilCompletedCheck, school)
      if (sut.checkForm !== null) {
        try {
          sut.checkForm.items[0].f1 = 9 // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.checkForm.items[0].f1).toBe(1)
      }
    })

    test('it stores the device', () => {
      const sut = new ReportLine(null, null, null, null, device, null, pupilCompletedCheck, school)
      expect(sut.device).toBe(device)
    })

    test('the device is readonly', () => {
      const sut = new ReportLine(null, null, null, null, device, null, pupilCompletedCheck, school)
      if (sut.device !== null) {
        try {
          sut.device.browserFamily = 'TEST' // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.device.browserFamily).toBe('CHROME')
      }
    })

    test('it stores the events', () => {
      const sut = new ReportLine(null, null, null, null, null, events, pupilCompletedCheck, school)
      expect(sut.events).toBe(events)
    })

    test('the events are readonly', () => {
      const sut = new ReportLine(null, null, null, null, null, events, pupilCompletedCheck, school)
      if (sut.events !== null) {
        try {
          sut.events[0].type = 'QuestionIntroRendered' // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.events[0].type).toBe('QuestionRendered')
      }
    })
  })
})
