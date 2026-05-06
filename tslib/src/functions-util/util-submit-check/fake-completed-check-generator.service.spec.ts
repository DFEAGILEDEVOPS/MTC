import { FakeCompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import mockPreparedCheck from '../../common/mocks/mock-prepared-check-2021.json'
import { type CheckQuestion, type CompleteCheckAnswer } from '../../schemas/check-schemas/validated-check'

let sut: FakeCompletedCheckGeneratorService

describe('submitted-check-generator-service', () => {
  beforeEach(() => {
    sut = new FakeCompletedCheckGeneratorService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(FakeCompletedCheckGeneratorService)
  })

  test('checkCode matches preparedCheck', () => {
    const completeCheck = sut.create(mockPreparedCheck)
    expect(completeCheck).toBeDefined()
    expect(completeCheck.checkCode).toStrictEqual(mockPreparedCheck.checkCode)
    expect(completeCheck.pupil.checkCode).toStrictEqual(mockPreparedCheck.checkCode)
  })

  test('school uuid matches preparedCheck', () => {
    const completeCheck = sut.create(mockPreparedCheck)
    expect(completeCheck).toBeDefined()
    expect(completeCheck.schoolUUID).toStrictEqual(mockPreparedCheck.school.uuid)
    expect(completeCheck.school.uuid).toStrictEqual(mockPreparedCheck.school.uuid)
  })

  test('answer count should match question count', () => {
    const completeCheck = sut.create(mockPreparedCheck)
    expect(completeCheck.answers).toHaveLength(mockPreparedCheck.questions.length)
  })

  test('answer count from the correct form should equal the amount requested', () => {
    const responses = sut.createResponses(mockPreparedCheck.questions, 7) // the mock has 10 questions
    expect(responses.answers).toHaveLength(7)
  })

  test('answer count from the incorrect forms should equal the amount requested', () => {
    const responses = sut.createResponses(mockPreparedCheck.questions, 0, 6) // the mock has 10 questions
    expect(responses.answers).toHaveLength(6)
  })

  test('answer count with mixed correct and incorrect forms should equal the amount requested', () => {
    const response = sut.createResponses(mockPreparedCheck.questions, 5, 7) // the mock has 10 questions
    expect(response.answers).toHaveLength(12)
    const correctCheckFormAnswers = filterValidAnswers(mockPreparedCheck.questions, response.answers)
    expect(correctCheckFormAnswers).toHaveLength(5)
    const invalidCheckFormAnswers = filterInValidAnswers(mockPreparedCheck.questions, response.answers)
    expect(invalidCheckFormAnswers).toHaveLength(7)
  })
})

/**
 *
 * @param haystack Return true if the needle Question is found in the array
 * @param needle
 */
function isValidAnswer (haystack: CheckQuestion[], needle: CompleteCheckAnswer): boolean {
  for (const questionToTest of haystack) {
    if (needle.factor1 === questionToTest.factor1 && needle.factor2 === questionToTest.factor2) {
      return true
    }
  }
  return false
}

function filterValidAnswers (questions: CheckQuestion[], answers: CompleteCheckAnswer[]): CompleteCheckAnswer[] {
  return answers.filter((ans) => { return isValidAnswer(questions, ans) })
}

function filterInValidAnswers (questions: CheckQuestion[], answers: CompleteCheckAnswer[]): CompleteCheckAnswer[] {
  return answers.filter((ans) => { return !isValidAnswer(questions, ans) })
}
