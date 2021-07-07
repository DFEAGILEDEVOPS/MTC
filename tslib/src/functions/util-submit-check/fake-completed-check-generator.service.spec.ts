import { FakeCompletedCheckGeneratorService } from './fake-completed-check-generator.service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'

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
})
