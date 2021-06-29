import { SubmittedCheckBuilderService } from './submitted-check-builder-service'
import mockPreparedCheck from '../../schemas/check-schemas/mock-prepared-check-2021.json'

let sut: SubmittedCheckBuilderService

describe('submitted-check-builder-service', () => {
  beforeEach(() => {
    sut = new SubmittedCheckBuilderService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeInstanceOf(SubmittedCheckBuilderService)
  })

  test('checkCode matches preparedCheck', () => {
    const completeCheck = sut.create(mockPreparedCheck)
    expect(completeCheck).toBeDefined()
    expect(completeCheck.checkCode).toStrictEqual(mockPreparedCheck.checkCode)
    expect(completeCheck.pupil.checkCode).toStrictEqual(mockPreparedCheck.checkCode)
    console.dir(completeCheck)
  })
})
