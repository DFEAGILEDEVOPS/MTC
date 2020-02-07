
export class SchoolPinReplenishmnentService {

  private dataService: ISchoolPinReplenishmentDataService

  constructor(dataService?: ISchoolPinReplenishmentDataService) {
    if (dataService === undefined) {
      dataService = new SchoolPinReplenishmentDataService()
    }
    this.dataService = dataService
  }
}

export class SchoolPinReplenishmentDataService implements ISchoolPinReplenishmentDataService {
  getSchools (): School[] {
    throw new Error('Method not implemented.')
  }

  setPins (schools: Array<School>) {
    throw new Error('not implemented')
  }
}

export interface ISchoolPinReplenishmentDataService {
  getSchools (): Array<School>
}

export interface School {
  id: number
  name: string
  utcOffset: number
}
