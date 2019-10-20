
import { IPupil } from './IPupil'
import { IDateTimeService } from '../../common/DateTimeService'
import { ICheckFormAllocationService } from './ICheckFormAllocationService'
import moment from 'moment'
import { IPupilPinGenerationService } from './PupilPinGenerationService'
import { PupilAllocationService } from './PupilAllocationService'

const PupilPinGenerationServiceMock = jest.fn<IPupilPinGenerationService, any>(() => ({
  generate: jest.fn()
}))

const theSeventies = '1970-01-01 00:00:00'
const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(() => moment(theSeventies))
}))

const CheckFormAllocationServiceMock = jest.fn<ICheckFormAllocationService, any>(() => ({
  allocate: jest.fn()
}))

let sut: PupilAllocationService
let pupilPinGenerationServiceMock: IPupilPinGenerationService
let dateTimeServiceMock: IDateTimeService
let checkFormAllocationServiceMock: ICheckFormAllocationService

describe('PupilAllocationService', () => {

  beforeEach(() => {
    pupilPinGenerationServiceMock = new PupilPinGenerationServiceMock()
    dateTimeServiceMock = new DateTimeServiceMock()
    checkFormAllocationServiceMock = new CheckFormAllocationServiceMock()
    sut = new PupilAllocationService(pupilPinGenerationServiceMock,
      checkFormAllocationServiceMock,
      dateTimeServiceMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('a pin should be generated for a pupil', async () => {
    let pupil: IPupil = {
      id: 123
    }
    await sut.allocate(pupil)
    expect(pupilPinGenerationServiceMock.generate).toHaveBeenCalledTimes(1)
  })

  test('a form should be allocated for a pupil', async () => {
    let pupil: IPupil = {
      id: 123
    }
    await sut.allocate(pupil)
    expect(checkFormAllocationServiceMock.allocate).toHaveBeenCalledTimes(1)
    expect(checkFormAllocationServiceMock.allocate).toHaveBeenCalledWith(pupil.id)
  })

  test('the allocation should be timestamped with current UTC', async () => {
    let pupil: IPupil = {
      id: 123
    }
    const expectedTimestamp = moment(theSeventies)
    const allocation = await sut.allocate(pupil)
    expect(dateTimeServiceMock.utcNow).toHaveBeenCalledTimes(1)
    expect(checkFormAllocationServiceMock.allocate).toHaveBeenCalledWith(pupil.id)
    expect(allocation).toBeDefined()
    expect(allocation.allocatedAtUtc).toStrictEqual(expectedTimestamp)
  })
})
