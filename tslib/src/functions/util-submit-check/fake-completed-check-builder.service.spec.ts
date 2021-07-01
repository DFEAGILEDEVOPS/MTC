import { FakeCompletedCheckBuilderService } from './fake-completed-check-builder.service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'

let sut: FakeCompletedCheckBuilderService

describe('submitted-check-builder-service', () => {
  beforeEach(() => {
    sut = new FakeCompletedCheckBuilderService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(FakeCompletedCheckBuilderService)
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

  test('inspect audits', () => {
    const completeCheck = sut.create(mockPreparedCheck)
    console.dir(JSON.stringify(completeCheck, null, 2))
    expect(completeCheck).toBeDefined()
  })
})
