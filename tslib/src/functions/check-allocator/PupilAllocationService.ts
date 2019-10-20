import { IPupilAllocation, IPupil } from './IPupil'
import { IDateTimeService, DateTimeService } from '../../common/DateTimeService'
import { ICheckFormAllocationService, CheckFormAllocationService } from './ICheckFormAllocationService'
import { IPupilPinGenerationService, PupilPinGenerationService } from './PupilPinGenerationService'

export interface IPupilAllocationService {
  allocate (pupil: IPupil): Promise<IPupilAllocation>
}

export class PupilAllocationService implements IPupilAllocationService {
  private _pupilPinGenerationService: IPupilPinGenerationService
  private _checkFormAllocationService: ICheckFormAllocationService
  private _dateTimeService: IDateTimeService

  constructor (pupilPinGenerationService?: IPupilPinGenerationService, checkFormAllocationService?: ICheckFormAllocationService, dateTimeService?: IDateTimeService) {
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
      allocatedForm: await this._checkFormAllocationService.allocate(pupil.id),
      allocatedAtUtc: this._dateTimeService.utcNow()
    }
    return allocation
  }
}
