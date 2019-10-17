import { CheckAllocatorV1, ICheckAllocatorDataService, IPupilPinGenerator, IPupil } from './check-allocator'
import * as uuid from 'uuid'

let sut: CheckAllocatorV1
const DataServiceMock = jest.fn<ICheckAllocatorDataService, any>(() => ({
  getPupilsBySchoolUuid: jest.fn()
}))

const PupilPinGeneratorMock = jest.fn<IPupilPinGenerator, any>(() => ({
  generate: jest.fn()
}))

let dataServiceMock: ICheckAllocatorDataService
let pupilPinGeneratorMock: IPupilPinGenerator
let schoolUUID: string

describe('check-allocator/v1', () => {
  beforeEach(() => {
    dataServiceMock = new DataServiceMock()
    pupilPinGeneratorMock = new PupilPinGeneratorMock()
    sut = new CheckAllocatorV1(dataServiceMock, pupilPinGeneratorMock)
    schoolUUID = uuid.v4()
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

  test('it should fetch all pupils within specified school from data service', async () => {
    await sut.allocate(schoolUUID)
    expect(dataServiceMock.getPupilsBySchoolUuid).toHaveBeenCalledWith(schoolUUID)
  })

  test('a pupil pin is generated  for each pupil that does not currently have an allocation', async () => {
    const schoolPupils = new Array<IPupil>()
    schoolPupils.push(
      {
        id: 123
      })
    dataServiceMock.getPupilsBySchoolUuid = jest.fn(async (schoolUUID: string) => {
      return Promise.resolve(schoolPupils)
    })
    await sut.allocate(schoolUUID)
    expect(pupilPinGeneratorMock.generate).toHaveBeenCalledTimes(schoolPupils.length)
  })

  test.todo('the school pin is only regenerated on the overnight run - separate service?')
  test.todo('a form is allocated for each pupil that does not currently have an allocation')
  test.todo('a redis entry is created for each replenished allocation')
  test.todo('the redis entry contains the current timestamp in UTC')
})
