import { CheckAllocatorV1, ICheckAllocatorDataService } from './check-allocator'
import * as uuid from 'uuid'

let sut: CheckAllocatorV1
const DataServiceMock = jest.fn<ICheckAllocatorDataService, any>(() => ({
  getPupilsBySchoolUuid: jest.fn()
}))

let dataServiceMock: ICheckAllocatorDataService

describe('check-allocator/v1', () => {
  beforeEach(() => {
    dataServiceMock = new DataServiceMock()
    sut = new CheckAllocatorV1(dataServiceMock)
  })

  test('it should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('an error is thrown when school UUID is not a valid UUID', async () => {
    const invalidUuidValues = [
      'i am not a UUID', // clearly incorrect
      '64b182f0-04fc-4dac-88c3-', // final section missing
      '64b182f0-04fc-4dac-88c3-dc6fcb1cba5' // one char short
    ]
    for (let index = 0; index < invalidUuidValues.length; index++) {
      const invalidUuid = invalidUuidValues[index]
      try {
        await sut.allocate(invalidUuid)
        fail('an error should have been thrown')
      } catch (error) {
        expect(error.message).toBe('schoolUUID argument was not a v4 UUID')
      }
    }
  })

  test('it should fetch all pupils within specified school', async () => {
    const schoolUuid = uuid.v4()
    await sut.allocate(schoolUuid)
    expect(dataServiceMock.getPupilsBySchoolUuid).toHaveBeenCalledWith(schoolUuid)
  })

  test('a pupil pin is generated  for each pupil that does not currently have an allocation')
  test('the school pin is only regenerated on the overnight (wildcard) run')
  test('a form is allocated for each pupil that does not currently have an allocation')
  test('a redis entry is created for each replenished allocation')
  test('the redis entry contains the current timestamp in UTC')
})
