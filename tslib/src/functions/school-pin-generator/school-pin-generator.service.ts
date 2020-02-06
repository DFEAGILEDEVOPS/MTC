
export class SchoolPinGenerator {

  private dataService: ISchoolPinGeneratorDataService

  constructor(dataService?: ISchoolPinGeneratorDataService) {
    if (dataService === undefined) {
      dataService = new SchoolPinGeneratorDataService()
    }
    this.dataService = dataService
  }
}

export class SchoolPinGeneratorDataService implements ISchoolPinGeneratorDataService {
  getSchools (): School[] {
    throw new Error('Method not implemented.')
  }

  setPins (schools: Array<School>) {
    throw new Error('not implemented')
  }
}

export interface ISchoolPinGeneratorDataService {
  getSchools (): Array<School>
}

export interface School {
  id: number
  name: string
  utcOffset: number
}
