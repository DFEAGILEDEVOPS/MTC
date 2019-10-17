
export interface ICheckAllocatorDataService {
  getPupilsBySchoolUuid (schoolUUID: string): Array<any>
}

export class CheckAllocatorDataService implements ICheckAllocatorDataService {
  getPupilsBySchoolUuid (schoolUUID: string): any[] {
    throw new Error('Method not implemented.')
  }
}

export class CheckAllocatorV1 {
  private _dataService: ICheckAllocatorDataService
  private uuidV4RegexPattern = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i)

  constructor (checkAllocatorDataService?: ICheckAllocatorDataService) {
    if (checkAllocatorDataService === undefined) {
      checkAllocatorDataService = new CheckAllocatorDataService()
    }
    this._dataService = checkAllocatorDataService
  }

  async allocate (schoolUUID: string) {
    if (!schoolUUID.match(this.uuidV4RegexPattern)) {
      throw new Error('schoolUUID argument was not a v4 UUID')
    }
    this._dataService.getPupilsBySchoolUuid(schoolUUID)
  }
}
