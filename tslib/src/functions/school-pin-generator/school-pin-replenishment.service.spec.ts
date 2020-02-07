import { SchoolPinReplenishmnentService, ISchoolPinReplenishmentDataService, UtcOffsetResolver, School, SchoolPinUpdate } from './school-pin-replenishment.service'
import moment from 'moment'

const SchoolPinGeneratorDataServiceMock = jest.fn<ISchoolPinReplenishmentDataService, any>(() => ({
  getSchoolData: jest.fn(),
  updatePin: jest.fn()
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

  it('should create a new pin for each school that requires one', async () => {
    const oneHourAgo = moment().add(-1, 'hours')
    const schools: School[] = [
      {
        id: 1,
        name: 'school 1'
      },
      {
        id: 2,
        name: 'school 2',
        pinExpiresAt: oneHourAgo.toDate(),
        pin: 'abc12def'
      },
      {
        id: 3,
        name: 'school 3'
      }
    ]
    dataService.getSchoolData = jest.fn(async () => {
      return schools
    })
    let update: SchoolPinUpdate | undefined
    dataService.updatePin = jest.fn(async (schoolUpdate) => {
      update = schoolUpdate
    })
    await sut.process()
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
    expect(update).toBeDefined()
    // optional chaining not currently supported in our ts-jest setup
    expect(update ? update.id : undefined).toEqual(2)
  })
})













describe('utc-offset-resolver', () => {
  let sut: UtcOffsetResolver
  beforeEach(() => {
    sut = new UtcOffsetResolver()
  })

  test('should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('it should resolve utc offset correctly', () => {
    const tz = 'Asia/Tokyo'
    const expected = 9
    const actual = sut.resolveToHours(tz)
    expect(actual).toEqual(expected)
  })
})
