import * as RA from 'ramda-adjunct'

export interface ICheckAllocatorDataService {
  getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>>
}

export class CheckAllocatorDataService implements ICheckAllocatorDataService {
  async getPupilsBySchoolUuid (schoolUUID: string): Promise<Array<IPupil>> {
    throw new Error('Method not implemented.')
  }
}

export interface IPupilPinGenerator {
  generate (): number
}

export class PupilPinGenerator implements IPupilPinGenerator {
  generate (): number {
    throw new Error('not implemented')
  }
}

export interface IPupil {
  id: number
  pin?: number
}

export class CheckAllocatorV1 {
  private _dataService: ICheckAllocatorDataService
  private _pupilPinGenerator: IPupilPinGenerator
  private uuidV4RegexPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)

  constructor (checkAllocatorDataService?: ICheckAllocatorDataService,
            pupilPinGenerator?: IPupilPinGenerator) {
    if (checkAllocatorDataService === undefined) {
      checkAllocatorDataService = new CheckAllocatorDataService()
    }
    this._dataService = checkAllocatorDataService

    if (pupilPinGenerator === undefined) {
      pupilPinGenerator = new PupilPinGenerator()
    }
    this._pupilPinGenerator = pupilPinGenerator
  }

  async allocate (schoolUUID: string) {
    if (!schoolUUID.match(this.uuidV4RegexPattern)) {
      throw new Error('schoolUUID argument was not a v4 UUID')
    }

    const pupils = await this._dataService.getPupilsBySchoolUuid(schoolUUID)

    if (RA.isNilOrEmpty(pupils)) return

    for (let pupilIndex = 0; pupilIndex < pupils.length; pupilIndex++) {
      const pupil = pupils[pupilIndex]
      pupil.pin = this._pupilPinGenerator.generate()
    }
  }
}
