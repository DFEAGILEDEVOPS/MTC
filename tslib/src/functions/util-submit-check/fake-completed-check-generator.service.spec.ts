import { FakeCompletedCheckGeneratorService, ICompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'
import { CheckQuestion, CompleteCheckAnswer } from '../../schemas/check-schemas/validated-check'

let sut: FakeCompletedCheckGeneratorService

class TestFakeCompletedCheckGeneratorService extends FakeCompletedCheckGeneratorService implements ICompletedCheckGeneratorService {
  public testCreateAnswers (questions: CheckQuestion[], numberFromCorrectCheckForm: number = questions.length, numberFromIncorrectCheckForm: number = 0): CompleteCheckAnswer[] {
    // return this.createAnswers(questions, numberFromCorrectCheckForm, numberFromIncorrectCheckForm)
    return []
  }
}

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
    const tsut = new TestFakeCompletedCheckGeneratorService()
    const answers = tsut.testCreateAnswers(mockPreparedCheck.questions, 7) // the mock has 10 questions
    expect(answers).toHaveLength(7)
  })

  test('answer count from the incorrect forms should equal the amount requested', () => {
    const tsut = new TestFakeCompletedCheckGeneratorService()
    const answers = tsut.testCreateAnswers(mockPreparedCheck.questions, 0, 6) // the mock has 10 questions
    expect(answers).toHaveLength(6)
  })

  test('answer count with mixed correct and incorrect forms should equal the amount requested', () => {
    const tsut = new TestFakeCompletedCheckGeneratorService()
    const answers = tsut.testCreateAnswers(mockPreparedCheck.questions, 5, 7) // the mock has 10 questions
    expect(answers).toHaveLength(12)
    // In this prepared unit test all the non-form questions have an obvious characteristic: the first factor is
    // zero.
    expect(answers.filter(a => a.factor1 !== 0)).toHaveLength(5)
    expect(answers.filter(a => a.factor1 === 0)).toHaveLength(7)
  })
})
