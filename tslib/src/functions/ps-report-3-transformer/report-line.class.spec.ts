import { ReportLine } from './report-line.class'
import { pupil as pupilCompletedCheck } from './mocks/pupil-who-completed-a-check'
import { pupil as pupilNotAttending } from './mocks/pupil-not-attending'
import { pupil as pupilIncomplete } from './mocks/pupil-with-incomplete-check'
import { school } from './mocks/school'
import { answers } from './mocks/answers'
import { check } from './mocks/check'
import { check as checkIncomplete } from './mocks/check-incomplete'
import { checkConfig } from './mocks/check-config'
import { checkForm } from './mocks/check-form'
import { device } from './mocks/device'
import { events } from './mocks/events'
import { NotTakingCheckCode, RestartReasonCode } from '../../functions-throttled/ps-report-2-pupil-data/models'
import { DfEAbsenceCode } from './models'

class ReportLineTest extends ReportLine {
  public getReasonNotTakingCheck (code: NotTakingCheckCode): string

  // @ts-ignore - let's allow function overloading of static functions for ease of testing
  public static getReasonNotTakingCheck (code: NotTakingCheckCode | null): DfEAbsenceCode | null {
    return ReportLine.getReasonNotTakingCheck(code)
  }

  // @ts-ignore - let's allow function overloading of static functions for ease of testing
  public static getRestartReason (code: RestartReasonCode | null): number | null {
    return ReportLine.getRestartReason(code)
  }
}
// See Psychometric Report Data Sourcing for a clearer view of the data sources and groupings.

describe('report line class', () => {
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
        expect(sut.answers[1].inputs[0].input).toBe('4')
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
        expect(sut.events[0].type).toBe('CheckStarted')
      }
    })
  })

  // The school tests do not have any dependency on the pupil or other data sources.
  describe('school information', () => {
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

    test('the school name is mapped', () => {
      const out = sut.transform()
      expect(out.SchoolName).toBe('test town primary school')
    })

    test('the estabCode is mapped', () => {
      const out = sut.transform()
      expect(out.Estab).toBe(999)
    })

    test('the school URN is mapped', () => {
      const out = sut.transform()
      expect(out.SchoolURN).toBe(80001)
    })

    test('the school local authority number is mapped', () => {
      const out = sut.transform()
      expect(out.LAnum).toBe(1001)
    })
  })

  describe('the pupil has completed a check', () => {
    describe('pupil information', () => {
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

      test('it maps the pupil DOB', () => {
        const out = sut.transform()
        expect(out).toHaveProperty('DOB')
        expect(out.DOB?.toISOString()).toBe('2012-03-07T00:00:00.000Z')
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

      test('it determines the pupil status', () => {
        const out = sut.transform()
        expect(out.PupilStatus).toBe('Complete')
      })

      test('the pupil database id is output so it can be the ps report PK', () => {
        const out = sut.transform()
        expect(out.PupilDatabaseId).toBe(2)
      })
    })

    describe('settings', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          checkConfig,
          null,
          null,
          null,
          pupilCompletedCheck,
          school
        )
      })

      test('the amount of time the question is displayed for is mapped', () => {
        const out = sut.transform()
        expect(out.QDisplayTime).toBe(6)
      })

      test('the pause length between questions is mapped', () => {
        const out = sut.transform()
        expect(out.PauseLength).toBe(3)
      })

      test('the pupils access arrangements are mapped', () => {
        const out = sut.transform()
        expect(out.AccessArr).toBe('[3][5]')
      })
    })

    describe('check fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          answers,
          check,
          null,
          checkForm,
          null,
          events,
          pupilCompletedCheck,
          school
        )
      })

      test('the attempt ID is mapped', () => {
        const out = sut.transform()
        expect(out.AttemptID).toBe('xyz-def-987')
      })

      test('the form name is mapped', () => {
        const out = sut.transform()
        expect(out.FormID).toBe('Test check form 9')
      })

      test('the date the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TestDate?.toISOString()).toBe('2021-01-21T09:00:00.000Z')
      })

      test('the time that the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TimeStart?.toISOString()).toBe('2021-01-21T09:00:01.123Z')
      })

      test('the time that the test was completed is mapped', () => {
        const out = sut.transform()
        expect(out.TimeComplete?.toISOString()).toBe('2021-01-21T09:00:21.000Z')
      })

      test('the time taken is calculated', () => {
        const out = sut.transform()
        expect(out.TimeTaken).toBe(19.877)
      })

      test('the number of restarts is mapped', () => {
        const out = sut.transform()
        expect(out.RestartNumber).toBe(2)
      })

      test('the restart reason is mapped', () => {
        const out = sut.transform()
        expect(out.RestartReason).toBe(1)
      })

      test('the mark is mapped', () => {
        const out = sut.transform()
        expect(out.FormMark).toBe(1)
      })
    })

    describe('device fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          null,
          null,
          device,
          null,
          pupilCompletedCheck,
          school
        )
      })

      test('BrowserType is mapped correctly', () => {
        const out = sut.transform()
        expect(out.BrowserType).toBe('CHROME 9.10.11')
      })

      test('DeviceID is mapped correctly', () => {
        const out = sut.transform()
        expect(out.DeviceID).toBe('1234567890abcde')
      })
    })

    describe('question fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          answers,
          check,
          null,
          null,
          null,
          events,
          pupilCompletedCheck,
          school
        )
      })

      test('it maps the questionNumber for each question', () => {
        const out = sut.transform()
        expect(out.answers[0].questionNumber).toBe(1)
        expect(out.answers[1].questionNumber).toBe(2)
      })

      test('it maps the id for each question', () => {
        const out = sut.transform()
        expect(out.answers[0].id).toBe('1x1')
        expect(out.answers[1].id).toBe('1x2')
      })

      test('it maps the response for each question', () => {
        const out = sut.transform()
        expect(out.answers[0].response).toBe('1')
        expect(out.answers[1].response).toBe('42')
      })

      test('it maps the inputMethods for each answer', () => {
        const out = sut.transform()
        expect(out.answers[0].inputMethods).toBe('k')
        expect(out.answers[1].inputMethods).toBe('m')
      })

      test('it maps the keystrokes for each answer', () => {
        const out = sut.transform()
        expect(out.answers[0].keystrokes).toBe('k[1]')
        expect(out.answers[1].keystrokes).toBe('m[4], m[2], m[Enter]')
      })

      test('it maps the score for each answer', () => {
        const out = sut.transform()
        expect(out.answers[0].score).toBe(1)
        expect(out.answers[1].score).toBe(0)
      })

      test('first key input time is calculated correctly', () => {
        const out = sut.transform()
        expect(out.answers[0].firstKey?.toISOString()).toBe('2021-01-21T09:00:05.123Z')
        expect(out.answers[1].firstKey?.toISOString()).toBe('2021-01-21T09:00:14.000Z')
      })

      test('last key input time is calculated correctly', () => {
        const out = sut.transform()
        expect(out.answers[0].lastKey?.toISOString()).toBe('2021-01-21T09:00:05.123Z')
        expect(out.answers[1].lastKey?.toISOString()).toBe('2021-01-21T09:00:14.333Z')
      })

      test('response time is calculated correctly', () => {
        const out = sut.transform()
        expect(out.answers[0].responseTime).toBe(0)
        expect(out.answers[1].responseTime).toBe(0.333)
      })

      test('whether the question timed out is determined', () => {
        const out = sut.transform()
        expect(out.answers[0].timeout).toBe(true) // question timed out, user did NOT press enter
        expect(out.answers[1].timeout).toBe(false) // did not time out
      })

      describe('#timeoutResponse', () => {
        test('whether the question timed out with a response', () => {
          const out = sut.transform()
          expect(out.answers[0].timeoutResponse).toBe(true)
          expect(out.answers[1].timeoutResponse).toBeNull()
          expect(out.answers[2].timeoutResponse).toBe(false)
        })
      })

      test('it determines QnTimeOutSco', () => {
        const out = sut.transform()
        expect(out.answers[0].timeoutScore).toBe(true) // return true if there was a timeout and the answer was correct
        expect(out.answers[1].timeoutScore).toBeNull() // return null if there was not a timeout
        expect(out.answers[2].timeoutScore).toBe(false) // return false if there was a timeout and the answer was incorrect
      })

      test('it determines the question load time', () => {
        const out = sut.transform()
        expect(out.answers[0].loadTime?.toISOString()).toBe('2021-01-21T09:00:04.140Z')
        expect(out.answers[1].loadTime?.toISOString()).toBe('2021-01-21T09:00:13.124Z')
        expect(out.answers[2].loadTime?.toISOString()).toBe('2021-01-21T09:00:18.790Z')
      })

      test('it determines the overall time taken', () => {
        const out = sut.transform()
        expect(out.answers[0].overallTime).toBe(0.983)
        expect(out.answers[1].overallTime).toBe(1.209)
        expect(out.answers[2].overallTime).toBeNull()
      })

      test('it determines the recall time', () => {
        const out = sut.transform()
        expect(out.answers[0].recallTime).toBe(0.983)
        expect(out.answers[1].recallTime).toBe(0.876)
        expect(out.answers[2].recallTime).toBeNull()
      })

      test('it determines the question reader start time', () => {
        const out = sut.transform()
        expect(out.answers[0].questionReaderStart?.toISOString()).toBe('2021-01-21T09:00:01.500Z')
      })

      test('it determines the question reader end time', () => {
        const out = sut.transform()
        expect(out.answers[0].questionReaderEnd?.toISOString()).toBe('2021-01-21T09:00:03.678Z')
      })
    })
  })

  describe('the pupil has been allocated a check, but didnt take it', () => {
    describe('pupil information (incomplete)', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          checkConfig,
          checkForm,
          null,
          null,
          pupilIncomplete,
          school
        )
      })

      test('it is defined', () => {
        expect(sut).toBeDefined()
      })

      test('it maps the pupil DOB', () => {
        const out = sut.transform()
        expect(out).toHaveProperty('DOB')
        expect(out.DOB?.toISOString()).toBe('2012-02-03T00:00:00.000Z')
      })

      test('it outputs the pupil gender in uppercase', () => {
        const out = sut.transform()
        expect(out.Gender).toBe('M')
      })

      test('it outputs the pupil ID', () => {
        const out = sut.transform()
        expect(out.PupilID).toBe('TEST985')
      })

      test('it outputs the pupil forename', () => {
        const out = sut.transform()
        expect(out.Forename).toBe('abc')
      })

      test('it outputs the pupil Surname', () => {
        const out = sut.transform()
        expect(out.Surname).toBe('def')
      })

      test('if the pupil has taken a check it should have a Reason For not Taking Check', () => {
        const out = sut.transform()
        expect(out.ReasonNotTakingCheck).toBeNull()
      })

      test('it determines the pupil status', () => {
        const out = sut.transform()
        expect(out.PupilStatus).toBe('Incomplete')
      })
    })

    describe('check fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          checkIncomplete,
          checkConfig,
          checkForm,
          null,
          null,
          pupilIncomplete,
          school
        )
      })

      test('the attempt ID is mapped', () => {
        const out = sut.transform()
        expect(out.AttemptID).toBe('xyz-def-988')
      })

      test('the form name is mapped', () => {
        const out = sut.transform()
        expect(out.FormID).toBe('Test check form 9')
      })

      test('the date the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TestDate).toBeNull()
      })

      test('the time that the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TimeStart).toBeNull()
      })

      test('the time that the test was completed is mapped', () => {
        const out = sut.transform()
        expect(out.TimeComplete).toBeNull()
      })

      test('the time taken is calculated', () => {
        const out = sut.transform()
        expect(out.TimeTaken).toBeNull()
      })

      test('the number of restarts is mapped', () => {
        const out = sut.transform()
        expect(out.RestartNumber).toBe(0)
      })

      test('the restart reason is mapped', () => {
        const out = sut.transform()
        expect(out.RestartReason).toBeNull()
      })

      test('the mark is mapped', () => {
        const out = sut.transform()
        expect(out.FormMark).toBeNull()
      })
    })

    describe('device fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          checkIncomplete,
          null,
          null,
          null,
          null,
          pupilIncomplete,
          school
        )
      })

      test('BrowserType is mapped correctly', () => {
        const out = sut.transform()
        expect(out.BrowserType).toBeNull()
      })

      test('DeviceID is mapped correctly', () => {
        const out = sut.transform()
        expect(out.DeviceID).toBeNull()
      })
    })

    describe('question fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          checkIncomplete,
          null,
          null,
          null,
          null,
          pupilIncomplete,
          school
        )
      })

      test('all the question fields should be null', () => {
        const out = sut.transform()
        expect(out.answers).toStrictEqual([])
      })
    })
  })

  describe('the pupil has been marked as not taking the check', () => {
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

      test('it outputs the pupil DOB in uk format', () => {
        const out = sut.transform()
        expect(out).toHaveProperty('DOB')
        expect(out.DOB?.toISOString()).toBe('2012-04-01T00:00:00.000Z')
      })

      test('it outputs the pupil gender in uppercase', () => {
        const out = sut.transform()
        expect(out.Gender).toBe('M')
      })

      test('it outputs the pupil ID', () => {
        const out = sut.transform()
        expect(out.PupilID).toBe('TEST986')
      })

      test('it outputs the pupil forename', () => {
        const out = sut.transform()
        expect(out.Forename).toBe('Tester')
      })

      test('it outputs the pupil Surname', () => {
        const out = sut.transform()
        expect(out.Surname).toBe('Person')
      })

      test('if the pupil has been marked as not taking the check it should have a Reason code', () => {
        const out = sut.transform()
        // TODO: 2022: reverse this back to 'A' after 2021
        expect(out.ReasonNotTakingCheck).toBe('Z')
      })

      test('the pupil status is set to Not taking the Check', () => {
        const out = sut.transform()
        expect(out.PupilStatus).toBe('Not taking the Check')
      })
    })

    describe('settings', () => {
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
      test('the amount of time the question is displayed for is mapped', () => {
        const out = sut.transform()
        expect(out.QDisplayTime).toBeNull()
      })

      test('the pause length between questions is mapped', () => {
        const out = sut.transform()
        expect(out.PauseLength).toBeNull()
      })

      test('the pupils access arrangements are mapped', () => {
        const out = sut.transform()
        expect(out.AccessArr).toBe('')
      })
    })

    describe('check fields', () => {
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

      test('the attempt ID is mapped', () => {
        const out = sut.transform()
        expect(out.AttemptID).toBeNull()
      })

      test('the form name is mapped', () => {
        const out = sut.transform()
        expect(out.FormID).toBeNull()
      })

      test('the date the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TestDate).toBeNull()
      })

      test('the time that the test was taken is mapped', () => {
        const out = sut.transform()
        expect(out.TimeStart).toBeNull()
      })

      test('the time that the test was completed is mapped', () => {
        const out = sut.transform()
        expect(out.TimeComplete).toBeNull()
      })

      test('the time taken is calculated', () => {
        const out = sut.transform()
        expect(out.TimeTaken).toBeNull()
      })

      test('the number of restarts is mapped', () => {
        const out = sut.transform()
        expect(out.RestartNumber).toBeNull()
      })

      test('the mark is mapped', () => {
        const out = sut.transform()
        expect(out.FormMark).toBeNull()
      })
    })

    describe('device fields', () => {
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

      test('BrowserType is mapped correctly', () => {
        const out = sut.transform()
        expect(out.BrowserType).toBeNull()
      })

      test('DeviceID is mapped correctly', () => {
        const out = sut.transform()
        expect(out.DeviceID).toBeNull()
      })
    })

    describe('question fields', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          null,
          checkIncomplete,
          null,
          null,
          null,
          null,
          pupilIncomplete,
          school
        )
      })

      test('all the question fields should be null', () => {
        const out = sut.transform()
        expect(out.answers).toStrictEqual([])
      })
    })
  })

  describe('getReasonNotTakingCheck', () => {
    test('returns Z for pupils incorrectly registered', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('INCRG')
      expect(res).toBe('Z')
    })

    /**
     * TODO 2022: For 2021 only, we map Absent to Incorrect Registration, as the check is optional
     */
    test('returns A for Absent pupils', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('ABSNT')
      expect(res).toBe('Z')
    })

    test('returns L for pupils who left', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('LEFTT')
      expect(res).toBe('L')
    })

    test('returns U for pupils who are unable to access', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('NOACC')
      expect(res).toBe('U')
    })

    test('returns B for pupils who are working below standard', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('BLSTD')
      expect(res).toBe('B')
    })

    test('returns J for pupils who just arrived', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('JSTAR')
      expect(res).toBe('J')
    })

    test('returns null if the code is null', () => {
      const res = ReportLineTest.getReasonNotTakingCheck(null)
      expect(res).toBeNull()
    })
  })

  describe('get restart reason mapping', () => {
    test('returns 1 for Loss of internet', () => {
      const res = ReportLineTest.getRestartReason('LOI')
      expect(res).toBe(1)
    })

    test('returns 2 for Local IT issues', () => {
      const res = ReportLineTest.getRestartReason('ITI')
      expect(res).toBe(2)
    })

    test('returns 3 for Classroom disruption', () => {
      const res = ReportLineTest.getRestartReason('CLD')
      expect(res).toBe(3)
    })

    test('returns 4 for Pupil did not complete', () => {
      const res = ReportLineTest.getRestartReason('DNC')
      expect(res).toBe(4)
    })

    test('returns null if given null', () => {
      const res = ReportLineTest.getRestartReason(null)
      expect(res).toBeNull()
    })
  })
})
