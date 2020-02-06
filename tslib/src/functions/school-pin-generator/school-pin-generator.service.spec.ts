import { SchoolPinGenerator, ISchoolPinGeneratorDataService } from './school-pin-generator.service'

const SchoolPinGeneratorDataServiceMock = jest.fn<ISchoolPinGeneratorDataService, any>(() => ({
  getSchools: jest.fn()
}))

let sut: SchoolPinGenerator
let dataService: ISchoolPinGeneratorDataService

describe('school-pin-generator', () => {

  beforeEach(() => {
    dataService = new SchoolPinGeneratorDataServiceMock()
    sut = new SchoolPinGenerator(dataService)
  })

  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should generate pin for each school that meets schedule predicate', () => {

  })
})
