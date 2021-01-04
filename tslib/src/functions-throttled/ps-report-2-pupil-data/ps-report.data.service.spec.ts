import { PsReportDataService } from './ps-report.data.service'
import { MockLogger } from '../../common/logger'
import { ISqlService } from '../../sql/sql.service'
import moment from 'moment'

describe('ps-report.data.service', () => {
  let sut: PsReportDataService
  let logger: MockLogger
  let mockSqlService: ISqlService

  beforeEach(() => {
    logger = new MockLogger()
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    sut = new PsReportDataService(logger, mockSqlService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  describe('#getPupils', () => {
    test('it maps the db object to the response object correctly', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          attendanceId: 1,
          checkComplete: false,
          currentCheckId: 2,
          dateOfBirth: moment.utc('2011-01-21'),
          foreName: 'abc',
          gender: 'F',
          id: 3,
          lastName: 'def',
          notTakingCheckReason: 'ghi',
          school_id: 4,
          urlSlug: 'jkl',
          upn: 'mno'
        }
      ])
      const pupils = await sut.getPupils('abc-def')
      expect(pupils).toHaveLength(1)
      expect(mockSqlService.query).toHaveBeenCalledTimes(1)
      const p = pupils[0]
      expect(p.attendanceId).toBe(1)
      expect(p.checkComplete).toBe(false)
      expect(p.currentCheckId).toBe(2)
      expect(p.dateOfBirth.format('YYYY-MM-DD')).toBe('2011-01-21')
      expect(p.forename).toBe('abc')
      expect(p.lastname).toBe('def')
      expect(p.notTakingCheckReason).toBe('ghi')
      expect(p.schoolId).toBe(4)
      expect(p.slug).toBe('jkl')
      expect(p.upn).toBe('mno')
    })
  })

  describe('#getSchool', () => {
    test('it maps DBSchool to the School object', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          estabCode: 1,
          id: 2,
          leaCode: 3,
          name: 'abc',
          urlSlug: 'def',
          urn: 4
        }
      ])
      const school = await sut.getSchool(2)
      expect(school.estabCode).toBe(1)
      expect(school.id).toBe(2)
      expect(school.laCode).toBe(3)
      expect(school.name).toBe('abc')
      expect(school.slug).toBe('def')
      expect(school.urn).toBe(4)
    })
  })

  describe('#getCheckConfig', () => {
    test('it returns nulls if no check was taken', async () => {
      const checkConfig = await sut.getCheckConfig(null)
      expect(checkConfig).toBeNull()
    })

    test('it returns the checkConfig data directly from storage', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        { payload: '{ "foo": "bar" }' }
      ])
      const checkConfig = await sut.getCheckConfig(1)
      // @ts-ignore - obj type is immaterial in unit test
      expect(checkConfig).toStrictEqual({ foo: 'bar' })
    })
  })

  describe('#getCheck', () => {
    test('it returns nulls if no check was taken', async () => {
      const check = await sut.getCheck(null)
      expect(check).toBeNull()
    })

    test('it maps the DBCheck to the Check object', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          checkCode: 'abc',
          checkForm_id: 1,
          checkWindow_id: 2,
          complete: true,
          completedAt: moment('2021-01-04T10:07:12.345Z'),
          id: 3,
          inputAssistantAddedRetrospectively: true,
          isLiveCheck: false,
          mark: 4,
          processingFailed: true,
          pupilLoginDate: moment('2021-01-04T10:00:00.123Z'),
          received: false,
          restartNumber: 5
        }
      ])
      const check = await sut.getCheck(3)
      if (check === null) {
        fail('check is null')
      }
      expect(check.checkCode).toBe('abc')
      expect(check.checkFormId).toBe(1)
      expect(check.checkWindowId).toBe(2)
      expect(check.complete).toBe(true)
      expect(check.completedAt.toISOString()).toBe('2021-01-04T10:07:12.345Z')
      expect(check.id).toBe(3)
      expect(check.inputAssistantAddedRetrospectively).toBe(true)
      expect(check.isLiveCheck).toBe(false)
      expect(check.mark).toBe(4)
      expect(check.processingFailed).toBe(true)
      expect(check.pupilLoginDate.toISOString()).toBe('2021-01-04T10:00:00.123Z')
      expect(check.received).toBe(false)
      expect(check.restartNumber).toBe(5)
    })
  })

  describe('#getCheckForm', () => {
    test('it returns null for pupils without a check', async () => {
      const checkForm = await sut.getCheckForm(null)
      expect(checkForm).toBeNull()
    })

    test('maps the DBCheckForm to the CheckForm object', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          name: 'UT Form 1',
          formData: '[{"f1":1,"f2":1},{"f1":1,"f2":2}]'
        }])
      const checkForm = await sut.getCheckForm(1)
      expect(checkForm).not.toBeNull()
      if (checkForm === null) {
        fail('checkForm should not be null')
      }
      expect(checkForm.items).toHaveLength(2)
      expect(checkForm.items[0]).toStrictEqual({ f1: 1, f2: 1, questionNumber: 1 })
      expect(checkForm.items[1]).toStrictEqual({ f1: 1, f2: 2, questionNumber: 2 })
    })
  })

  describe('#getInputs', () => {
    test('it maps the user inputs for a check', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          answer_id: 1,
          userInput: '1',
          inputType: 'K',
          browserTimestamp: moment('2021-01-04T13:32:01.123Z')
        },
        {
          answer_id: 2,
          userInput: '2',
          inputType: 'K',
          browserTimestamp: moment('2021-01-04T13:38:01.456Z')
        },
        {
          answer_id: 2,
          userInput: 'Enter',
          inputType: 'K',
          browserTimestamp: moment('2021-01-04T13:38:02.789Z')
        }]
      )
      const inputs = await sut.getInputs(2)
      expect(inputs.size).toBe(2)
      const inputsForAnswer1 = inputs.get(1)
      if (inputsForAnswer1 === null || inputsForAnswer1 === undefined) {
        fail('inputs are not defined')
      }
      expect(inputsForAnswer1).toHaveLength(1)
      expect(inputsForAnswer1[0].answerId).toBe(1)
      expect(inputsForAnswer1[0].input).toBe('1')
      expect(inputsForAnswer1[0].inputType).toBe('K')
      expect(inputsForAnswer1[0].browserTimestamp.toISOString()).toBe('2021-01-04T13:32:01.123Z')
      const inputsForAnswer2 = inputs.get(2)
      if (inputsForAnswer2 === null || inputsForAnswer2 === undefined) {
        fail('inputs are not defined')
      }
      expect(inputsForAnswer2).toHaveLength(2)
      expect(inputsForAnswer2[0].answerId).toBe(2)
      expect(inputsForAnswer2[0].input).toBe('2')
      expect(inputsForAnswer2[0].inputType).toBe('K')
      expect(inputsForAnswer2[0].browserTimestamp.toISOString()).toBe('2021-01-04T13:38:01.456Z')
      expect(inputsForAnswer2[1].answerId).toBe(2)
      expect(inputsForAnswer2[1].input).toBe('Enter')
      expect(inputsForAnswer2[1].inputType).toBe('K')
      expect(inputsForAnswer2[1].browserTimestamp.toISOString()).toBe('2021-01-04T13:38:02.789Z')
    })
  })

  describe('#getAnswers', () => {
    test('it returns null for a pupil who has not taken a check', async () => {
      const answers = await sut.getAnswers(null)
      expect(answers).toBeNull()
    })

    test('it maps the DBAnswer object to the InputMap object', async () => {
      (mockSqlService.query as jest.Mock).mockResolvedValueOnce([
        {
          id: 1,
          answer: '2',
          questionCode: 'Q002',
          question: '1x2',
          isCorrect: true,
          browserTimestamp: moment('2021-02-04T15:06:01.333Z')
        }])
        .mockResolvedValueOnce([
          {
            answer_id: 1,
            userInput: '2',
            inputType: 'M',
            browserTimestamp: moment('2021-02-04T15:06:01.111Z')
          }])
      const answers = await sut.getAnswers(1)
      expect(answers).not.toBeNull()
      if (answers === null) {
        fail('answers are not defined')
      }
      const answer = answers[0]
      expect(answers).toHaveLength(1)
      expect(answer.browserTimestamp.toISOString()).toBe('2021-02-04T15:06:01.333Z')
      expect(answer.id).toBe(1)
      expect(answer.inputs).toHaveLength(1)
      expect(answer.isCorrect).toBe(true)
      expect(answer.question).toBe('1x2')
      expect(answer.questionCode).toBe('Q002')
      expect(answer.response).toBe('2')
    })
  })
})
