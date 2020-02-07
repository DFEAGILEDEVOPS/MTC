import { SchoolPinReplenishmnentService, ISchoolPinReplenishmentDataService, UtcOffsetResolver, School, SchoolPinUpdate, SchoolRequiresNewPinPredicate } from './school-pin-replenishment.service'
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
    const oneHourAway = moment().add(1, 'hours')

    const schools: School[] = [
      {
        id: 1,
        name: 'school 1',
        pinExpiresAt: oneHourAway,
        pin: 'abc12def'
      },
      {
        id: 2,
        name: 'school 2',
        pinExpiresAt: oneHourAgo,
        pin: 'foo23bar'
      },
      {
        id: 3,
        name: 'school 3',
        pinExpiresAt: oneHourAway,
        pin: 'baz44bug'
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

describe('school-requires-new-pin-predicate', () => {
  let sut: SchoolRequiresNewPinPredicate

  beforeEach(() => {
    sut = new SchoolRequiresNewPinPredicate()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('indicates pin required when pin is undefined', () => {
    const school: School = {
      id: 1,
      name: 'school'
    }
    const isRequired = sut.isRequired(school)
    expect(isRequired).toBe(true)
  })

  test('indicates pin required when pin is undefined', () => {
    const school: School = {
      id: 1,
      name: 'school'
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin not required when expiry date in future', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'abc12def',
      pinExpiresAt: moment().add(1,'hours')
    }
    expect(sut.isRequired(school)).toBe(false)
  })

  test('indicates pin required when expiry date in future but pin not defined', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: undefined,
      pinExpiresAt: moment().add(1,'hours')
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin required when expiry date not defined', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'acb12def',
      pinExpiresAt: undefined
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin required when expiry date has passed', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'acb12def',
      pinExpiresAt: moment().add(-1,'hours')
    }
    expect(sut.isRequired(school)).toBe(true)
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
