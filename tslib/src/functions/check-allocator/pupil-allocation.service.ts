import { IPupilAllocation, IPupil } from './models'
import { IDateTimeService, DateTimeService } from '../../common/datetime.service'
import { ICheckFormAllocationService, CheckFormAllocationService } from './check-form-allocation.service'
import { IPupilPinGenerationService, PupilPinGenerationService } from './pupil-pin-generation.service'

export interface IPupilAllocationService {
  allocate (pupil: IPupil): Promise<IPupilAllocation>
}

export class PupilAllocationService implements IPupilAllocationService {
  private pupilPinGenerationService: IPupilPinGenerationService
  private checkFormAllocationService: ICheckFormAllocationService
  private dateTimeService: IDateTimeService

  constructor (pupilPinGenerationService?: IPupilPinGenerationService, checkFormAllocationService?: ICheckFormAllocationService, dateTimeService?: IDateTimeService) {
    if (pupilPinGenerationService === undefined) {
      pupilPinGenerationService = new PupilPinGenerationService()
    }
    this.pupilPinGenerationService = pupilPinGenerationService
    if (checkFormAllocationService === undefined) {
      checkFormAllocationService = new CheckFormAllocationService()
    }
    this.checkFormAllocationService = checkFormAllocationService
    if (dateTimeService === undefined) {
      dateTimeService = new DateTimeService()
    }
    this.dateTimeService = dateTimeService
  }
  async allocate (pupil: IPupil): Promise<IPupilAllocation> {
    const allocation: IPupilAllocation = {
      id: pupil.id,
      pin: this.pupilPinGenerationService.generate(),
      allocatedForm: await this.checkFormAllocationService.allocate(pupil.id),
      allocatedAtUtc: this.dateTimeService.utcNow()
    }
    return allocation
  }
}
