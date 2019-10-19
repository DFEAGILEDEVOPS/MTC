
import { IPupilAllocation, IPupil } from './IPupil'
import { IDateTimeService, DateTimeService } from '../../common/DateTimeService'
import { ICheckFormAllocationService, CheckFormAllocationService } from './ICheckFormAllocationService'

export interface IPupilPinGenerationService {
  generate (): number
}

export class PupilPinGenerationService implements IPupilPinGenerationService {
  generate (): number {
    throw new Error('not implemented')
  }
}

export class PupilAllocationService {

  private _pupilPinGenerationService: IPupilPinGenerationService
  private _checkFormAllocationService: ICheckFormAllocationService
  private _dateTimeService: IDateTimeService

  constructor (pupilPinGenerationService?: IPupilPinGenerationService,
    checkFormAllocationService?: ICheckFormAllocationService,
    dateTimeService?: IDateTimeService) {

    if (pupilPinGenerationService === undefined) {
      pupilPinGenerationService = new PupilPinGenerationService()
    }
    this._pupilPinGenerationService = pupilPinGenerationService

    if (checkFormAllocationService === undefined) {
      checkFormAllocationService = new CheckFormAllocationService()
    }
    this._checkFormAllocationService = checkFormAllocationService

    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this._dateTimeService = dateTimeService
  }
  async allocate (pupil: IPupil): Promise<IPupilAllocation> {
    const allocation: IPupilAllocation = {
      id: pupil.id,
      pin: this._pupilPinGenerationService.generate(),
      allocatedForm: this._checkFormAllocationService.allocate(pupil.id),
      allocatedAtUtc: this._dateTimeService.utcNow()
    }
    return allocation
  }
}

const PupilPinGenerationServiceMock = jest.fn<IPupilPinGenerationService, any>(() => ({
  generate: jest.fn()
}))

const DateTimeServiceMock = jest.fn<IDateTimeService, any>(() => ({
  utcNow: jest.fn(() => new Date('1970-01-01'))
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
    const expectedTimestamp = new Date('1970-01-01')
    const allocation = await sut.allocate(pupil)
    expect(dateTimeServiceMock.utcNow).toHaveBeenCalledTimes(1)
    expect(checkFormAllocationServiceMock.allocate).toHaveBeenCalledWith(pupil.id)
    expect(allocation).toBeDefined()
    expect(allocation.allocatedAtUtc).toStrictEqual(expectedTimestamp)
  })
})
