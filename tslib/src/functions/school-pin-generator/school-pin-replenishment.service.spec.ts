import { SchoolPinReplenishmnentService, type School, type SchoolPinUpdate } from './school-pin-replenishment.service'
import moment from 'moment'
import { type ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { type ILogger, ConsoleLogger } from '../../common/logger'
import { type IPinConfigProvider } from './pin-config-provider'
import { type IModifyResult } from '../../sql/sql.service'
import { type IAllowedWordsService } from './allowed-words.service'

const SchoolPinGeneratorDataServiceMock = jest.fn<ISchoolPinReplenishmentDataService, any>(() => ({
  getAllSchools: jest.fn(),
  updatePin: jest.fn(),
  getSchoolById: jest.fn()
}))

const AllowedWordsServiceMock= jest.fn<IAllowedWordsService, any>(() => ({
  getAllowedWords: jest.fn()
}))

const configProviderMock: IPinConfigProvider = {
  BannedWords: 'dim',
  OverridePinExpiry: false,
  PinUpdateMaxAttempts: 5,
  DigitChars: '234'
}

let sut: SchoolPinReplenishmnentService
let dataService: ISchoolPinReplenishmentDataService
let allowedWordsServiceMock: IAllowedWordsService
const logger: ILogger = new ConsoleLogger()

describe('school-pin-replenishment.service', () => {
  beforeEach(() => {
    dataService = new SchoolPinGeneratorDataServiceMock()
    allowedWordsServiceMock = new AllowedWordsServiceMock()
    sut = new SchoolPinReplenishmnentService(dataService, undefined, configProviderMock, allowedWordsServiceMock)
  })

  test('should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinReplenishmnentService)
  })

  test('should create a new pin for each school that requires one when no school uuid provided', async () => {
    const oneHourAgo = moment().add(-1, 'hours')
    const oneHourFromNow = moment().add(1, 'hours')

    const schools: School[] = [
      {
        id: 1,
        name: 'school 1',
        pinExpiresAt: oneHourFromNow,
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
        pinExpiresAt: oneHourFromNow,
        pin: 'baz44bug'
      }
    ]
    jest.spyOn(dataService, 'getAllSchools').mockImplementation(async () => {
      return schools
    })
    let update: SchoolPinUpdate | undefined
    jest.spyOn(dataService, 'updatePin').mockImplementation(async (schoolUpdate) => {
      update = schoolUpdate
      const result: IModifyResult = {}
      return result
    })
    jest.spyOn(allowedWordsServiceMock, 'getAllowedWords').mockImplementation(async () => {
      return new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    })
    await sut.process(logger)
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
    expect(update).toBeDefined()
    // optional chaining not currently supported in our ts-jest setup
    expect(update?.id).toBe(2)
  })

  test('it should fail after making configured number of attempts', async () => {
    const oneHourAgo = moment().add(-1, 'hours')

    const schools: School[] = [
      {
        id: 1,
        name: 'school 1',
        pinExpiresAt: oneHourAgo,
        pin: 'foo23bar'
      }
    ]
    jest.spyOn(dataService, 'getAllSchools').mockImplementation(async () => {
      return schools
    })
    jest.spyOn(dataService, 'updatePin').mockImplementation(async () => {
      throw new Error('mock error')
    })
    jest.spyOn(allowedWordsServiceMock, 'getAllowedWords').mockImplementation(async () => {
      return new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    })
    await sut.process(logger)
    expect(dataService.updatePin).toHaveBeenCalledTimes(configProviderMock.PinUpdateMaxAttempts)
  })

  test('if no schools to process, service returns early', async () => {
    jest.spyOn(dataService, 'getAllSchools').mockImplementation(async () => {
      return []
    })
    await sut.process(logger)
    expect(dataService.updatePin).not.toHaveBeenCalled()
  })

  test('only updates single school specified when schoolUUID passed as param', async () => {
    jest.spyOn(dataService, 'getSchoolById').mockImplementation(async () => {
      const school: School = {
        id: 1,
        name: 'x'
      }
      return school
    })
    jest.spyOn(allowedWordsServiceMock, 'getAllowedWords').mockImplementation(async () => {
      return new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    })
    const schoolId = 42
    await sut.process(logger, schoolId)
    expect(dataService.getSchoolById).toHaveBeenCalledTimes(1)
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
  })

  test('returns generated pin when single schoolUUID passed as param', async () => {
    jest.spyOn(dataService, 'getSchoolById').mockImplementation(async () => {
      const school: School = {
        id: 1,
        name: 'x'
      }
      return school
    })
    jest.spyOn(allowedWordsServiceMock, 'getAllowedWords').mockImplementation(async () => {
      return new Set<string>(['foo', 'bar', 'baz', 'qix', 'pix'])
    })
    const schoolId = 42
    const generatedPin = await sut.process(logger, schoolId)
    expect(generatedPin).toBeDefined()
    expect(dataService.getSchoolById).toHaveBeenCalledTimes(1)
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
  })
})
