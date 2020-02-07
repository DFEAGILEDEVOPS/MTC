import { SchoolPinReplenishmnentService, ISchoolPinReplenishmentDataService } from './school-pin-replenishment.service'

const SchoolPinGeneratorDataServiceMock = jest.fn<ISchoolPinReplenishmentDataService, any>(() => ({
  getSchools: jest.fn()
}))

let sut: SchoolPinReplenishmnentService
let dataService: ISchoolPinReplenishmentDataService

describe('school-pin-replenishment.service', () => {

  beforeEach(() => {
    dataService = new SchoolPinGeneratorDataServiceMock()
    sut = new SchoolPinReplenishmnentService(dataService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should create a new pin for each school that meets schedule predicate', () => {
    fail('not implemented')
  })
})
