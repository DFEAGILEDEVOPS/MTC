import { ReportLine } from './report-line.class'
import { pupil as pupilCompletedCheck } from './mocks/pupil-who-completed-a-check'
import { pupil as pupilNotAttending } from './mocks/pupil-not-attending'
import { pupil as pupilAnnulled } from './mocks/pupil-not-attending-annulled'
import { pupil as pupilIncomplete } from './mocks/pupil-with-incomplete-check'
import { pupil as pupilIncompleteCorrupt } from './mocks/pupil-not-attending-corrupt'
import { pupil as pupilCompleteRestartAvailableCorrupt } from './mocks/pupil-complete-and-restart-available-corrupt'
import { school } from './mocks/school'
import { answers } from './mocks/answers'
import { check } from './mocks/check'
import { check as checkIncomplete } from './mocks/check-incomplete'
import { checkConfig } from './mocks/check-config'
import { checkForm } from './mocks/check-form'
import { device } from './mocks/device'
import { events } from './mocks/events'
import { type NotTakingCheckCode, type RestartReasonCode } from './pupil-data.models'
import { type DfEAbsenceCode } from './transformer-models'

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
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school, null)
      expect(sut.answers).toBe(answers)
    })

    test('the answers are readonly', () => {
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school, null)
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
      const sut = new ReportLine(answers, null, null, null, null, null, pupilCompletedCheck, school, null)
      // What about modification?
      if (Array.isArray(sut.answers) && sut.answers.length > 1) {
        try {
          sut.answers[1].inputs[0].input = '66' // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.answers[1].inputs[0].input).toBe('4')
      }
    })

    test('it stores the check', () => {
      const sut = new ReportLine(null, check, null, null, null, null, pupilCompletedCheck, school, null)
      expect(sut.check).toBe(check)
    })

    test('the check is readonly', () => {
      const sut = new ReportLine(null, check, null, null, null, null, pupilCompletedCheck, school, null)
      if (sut.check !== null) {
        try {
          sut.check.mark = 26 // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.check.mark).toBe(1)
      }
    })

    test('it stores the checkConfig', () => {
      const sut = new ReportLine(null, null, checkConfig, null, null, null, pupilCompletedCheck, school, null)
      expect(sut.checkConfig).toBe(checkConfig)
    })

    test('the checkConfig is readonly', () => {
      const sut = new ReportLine(null, null, checkConfig, null, null, null, pupilCompletedCheck, school, null)
      if (sut.checkConfig !== null) {
        try {
          sut.checkConfig.audibleSounds = true // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.checkConfig.audibleSounds).toBe(false)
      }
    })

    test('it stores the checkForm', () => {
      const sut = new ReportLine(null, null, null, checkForm, null, null, pupilCompletedCheck, school, null)
      expect(sut.checkForm).toBe(checkForm)
    })

    test('the checkForm is readonly', () => {
      const sut = new ReportLine(null, null, null, checkForm, null, null, pupilCompletedCheck, school, null)
      if (sut.checkForm !== null) {
        try {
          sut.checkForm.items[0].f1 = 9 // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.checkForm.items[0].f1).toBe(1)
      }
    })

    test('it stores the device', () => {
      const sut = new ReportLine(null, null, null, null, device, null, pupilCompletedCheck, school, null)
      expect(sut.device).toBe(device)
    })

    test('the device is readonly', () => {
      const sut = new ReportLine(null, null, null, null, device, null, pupilCompletedCheck, school, null)
      if (sut.device !== null) {
        try {
          sut.device.browserFamily = 'TEST' // attempt modification - compiler/interpreter should throw
        } catch (error) {}
        expect(sut.device.browserFamily).toBe('CHROME')
      }
    })

    test('it stores the events', () => {
      const sut = new ReportLine(null, null, null, null, null, events, pupilCompletedCheck, school, null)
      expect(sut.events).toBe(events)
    })

    test('the events are readonly', () => {
      const sut = new ReportLine(null, null, null, null, null, events, pupilCompletedCheck, school, null)
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
        school,
        null
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
          school,
          null
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
        expect(out.PupilUPN).toBe('TEST987')
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

    describe('retro input assistant in table takes precedence over checkConfig payload', () => {
      let sut: ReportLine
      const thisCheckConfig = {
        audibleSounds: false,
        checkTime: 30,
        colourContrast: false,
        fontSize: false,
        inputAssistance: false,
        loadingTime: 3,
        nextBetweenQuestions: false,
        numpadRemoval: false,
        practice: false,
        questionReader: false,
        questionTime: 6,
        compressCompletedCheck: true
      }

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          thisCheckConfig,
          null,
          null,
          null,
          pupilCompletedCheck,
          school,
          {
            isRetrospective: true
          }
        )
      })

      test('it maps the retro input assistant exactly the same as the input assistant', () => {
        const out = sut.transform()
        expect(out.AccessArr).toBe('[4]')
      })
    })

    describe('input assistant in table takes precedence over checkConfig payload', () => {
      let sut: ReportLine
      const thisCheckConfig = {
        audibleSounds: false,
        checkTime: 30,
        colourContrast: false,
        fontSize: false,
        inputAssistance: false,
        loadingTime: 3,
        nextBetweenQuestions: false,
        numpadRemoval: false,
        practice: false,
        questionReader: false,
        questionTime: 6,
        compressCompletedCheck: true
      }

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          thisCheckConfig,
          null,
          null,
          null,
          pupilCompletedCheck,
          school,
          {
            isRetrospective: false
          }
        )
      })

      test('it maps the standard input assistant exactly the same as the input assistant', () => {
        const out = sut.transform()
        expect(out.AccessArr).toBe('[4]')
      })
    })

    describe('other checkConfig payload settings and order are preserved', () => {
      let sut: ReportLine
      const thisCheckConfig = {
        audibleSounds: false,
        checkTime: 30,
        colourContrast: true,
        fontSize: true,
        inputAssistance: false,
        loadingTime: 3,
        nextBetweenQuestions: false,
        numpadRemoval: false,
        practice: false,
        questionReader: false,
        questionTime: 6,
        compressCompletedCheck: true
      }

      beforeEach(() => {
        sut = new ReportLine(
          null,
          null,
          thisCheckConfig,
          null,
          null,
          null,
          pupilCompletedCheck,
          school,
          {
            isRetrospective: false
          }
        )
      })

      test('it preserves the order of all check config and input assistant', () => {
        const out = sut.transform()
        expect(out.AccessArr).toBe('[3][4][5]')
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
          school,
          null
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
          school,
          null
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

      test('the number of restarts is an integer', () => {
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
          school,
          null
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
          school,
          null
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
          school,
          null
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
        expect(out.PupilUPN).toBe('TEST985')
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

      test('in the event of both checkComplete and attendanceId being set the pupil status is shown as Not taking check', () => {
        const report = new ReportLine(
          null,
          null,
          checkConfig,
          checkForm,
          null,
          null,
          pupilIncompleteCorrupt,
          school,
          null
        )
        const out = report.transform()
        expect(out.PupilStatus).toBe('Not taking the Check')
      })

      test('if the pupil is complete and (somehow) the restartAvailable flag is set, the pupil status is Incomplete', () => {
        const report = new ReportLine(
          null,
          null,
          checkConfig,
          checkForm,
          null,
          null,
          pupilCompleteRestartAvailableCorrupt,
          school,
          null
        )
        const out = report.transform()
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
          school,
          null
        )
      })

      test('the attempt ID is not mapped', () => {
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
          school,
          null
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
          school,
          null
        )
      })

      test('all the question fields should be null', () => {
        const out = sut.transform()
        expect(out.answers).toStrictEqual([])
      })
    })
  })

  describe('pupil is marked as annulled', () => {
    let sut: ReportLine
    beforeEach(() => {
      sut = new ReportLine(
        answers,
        check,
        checkConfig,
        checkForm,
        device,
        events,
        pupilAnnulled,
        school,
        null
      )
    })

    test('it is defined', () => {
      expect(sut).toBeDefined()
    })

    test('the check data is initialised', () => {
      const out = sut.transform()
      expect(out.PauseLength).not.toBeNull()
      expect(out.QDisplayTime).not.toBeNull()
      expect(out.AttemptID).not.toBeNull()
      expect(out.FormID).not.toBeNull()
      expect(out.TestDate).not.toBeNull()
      expect(out.TimeStart).not.toBeNull()
      expect(out.FormMark).toBeNull()
      expect(out.BrowserType).not.toBeNull()
      expect(out.DeviceID).not.toBeNull()
      expect(out.answers).not.toHaveLength(0)
    })

    test('the pupil has the annulled code', () => {
      const out = sut.transform()
      expect(out.ReasonNotTakingCheck).toBe('Q')
    })

    test('the pupil status is set to Not taking the Check', () => {
      const out = sut.transform()
      expect(out.PupilStatus).toBe('Not taking the Check')
    })
  })

  describe('the pupil has been marked as not taking the check', () => {
    describe('pupil information (not attending check)', () => {
      let sut: ReportLine

      beforeEach(() => {
        sut = new ReportLine(
          answers,
          check,
          checkConfig,
          checkForm,
          device,
          events,
          pupilNotAttending,
          school,
          null
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
        expect(out.PupilUPN).toBe('TEST986')
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
        expect(out.ReasonNotTakingCheck).toBe('A')
      })

      test('the pupil status is set to Not taking the Check', () => {
        const out = sut.transform()
        expect(out.PupilStatus).toBe('Not taking the Check')
      })

      test('the check data is all set to null', () => {
        const out = sut.transform()
        expect(out.PauseLength).toBeNull()
        expect(out.QDisplayTime).toBeNull()
        expect(out.AttemptID).toBeNull()
        expect(out.FormID).toBeNull()
        expect(out.TestDate).toBeNull()
        expect(out.TimeStart).toBeNull()
        expect(out.TimeComplete).toBeNull()
        expect(out.TimeTaken).toBeNull()
        expect(out.RestartNumber).toBeNull()
        expect(out.RestartReason).toBeNull()
        expect(out.FormMark).toBeNull()
        expect(out.BrowserType).toBeNull()
        expect(out.DeviceID).toBeNull()
        expect(out.answers).toHaveLength(0)
      })

      test('the restart number is set to null', () => {
        const out = sut.transform()
        expect(out.RestartNumber).toBeNull()
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
          school,
          null
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
          school,
          null
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
          school,
          null
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
          school,
          null
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

    test('returns A for Absent pupils', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('ABSNT')
      expect(res).toBe('A')
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

    test('returns H for pupils who are annulled as pupil cheating', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('ANLLH')
      expect(res).toBe('H')
    })

    test('returns Q for pupils who are annulled as Maladministration', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('ANLLQ')
      expect(res).toBe('Q')
    })

    test('returns NAA for pupils for Not Able To Administer', () => {
      const res = ReportLineTest.getReasonNotTakingCheck('NOABA')
      expect(res).toBe('NAA')
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

  describe('device', () => {
    test('a null device id reports as a null for the BrowserType', () => {
      const sut = new ReportLine(
        null,
        null,
        null,
        null,
        null,
        null,
        pupilCompletedCheck,
        school,
        null)
      const outputData = sut.transform()
      expect(outputData.BrowserType).toBeNull()
    })

    test('an all-null device obj reports as a null for the BrowserType', () => {
      const sut = new ReportLine(
        null,
        null,
        null,
        null,
        {
          browserFamily: null,
          browserMajorVersion: null,
          browserMinorVersion: null,
          browserPatchVersion: null,
          type: null,
          typeModel: null,
          deviceId: null
        },
        null,
        pupilCompletedCheck,
        school,
        null)
      const outputData = sut.transform()
      expect(outputData.BrowserType).toBeNull()
    })

    test('an null browser family device obj reports correctly', () => {
      const sut = new ReportLine(
        null,
        null,
        null,
        null,
        {
          browserFamily: null,
          browserMajorVersion: 5,
          browserMinorVersion: 4,
          browserPatchVersion: null,
          type: null,
          typeModel: null,
          deviceId: null
        },
        null,
        pupilCompletedCheck,
        school,
        null)
      const outputData = sut.transform()
      expect(outputData.BrowserType).toBe('5.4')
    })

    test('an null version field device obj reports correctly', () => {
      const sut = new ReportLine(
        null,
        null,
        null,
        null,
        {
          browserFamily: 'Browser',
          browserMajorVersion: null,
          browserMinorVersion: null,
          browserPatchVersion: null,
          type: null,
          typeModel: null,
          deviceId: null
        },
        null,
        pupilCompletedCheck,
        school,
        null)
      const outputData = sut.transform()
      expect(outputData.BrowserType).toBe('Browser')
    })
  })
})
