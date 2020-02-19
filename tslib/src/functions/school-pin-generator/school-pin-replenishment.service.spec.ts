import { SchoolPinReplenishmnentService, School, SchoolPinUpdate } from './school-pin-replenishment.service'
import moment from 'moment'
import { ISchoolPinReplenishmentDataService } from './school-pin-replenishment.data.service'
import { ILogger } from '../../common/logger'
import { ConfigFileProvider } from './config-file-provider'
import * as uuid from 'uuid'

const SchoolPinGeneratorDataServiceMock = jest.fn<ISchoolPinReplenishmentDataService, any>(() => ({
  getAllSchools: jest.fn(),
  updatePin: jest.fn(),
  getSchoolByUuid: jest.fn()
}))

let sut: SchoolPinReplenishmnentService
let dataService: ISchoolPinReplenishmentDataService
let logger: ILogger = {
  error: jest.fn(),
  info: jest.fn(),
  verbose: jest.fn(),
  warn: jest.fn()
}

describe('school-pin-replenishment.service', () => {

  beforeEach(() => {
    dataService = new SchoolPinGeneratorDataServiceMock()
    sut = new SchoolPinReplenishmnentService(dataService, undefined, new ConfigFileProvider())
  })

  it('should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolPinReplenishmnentService)
  })

  it('should create a new pin for each school that requires one when no school uuid provided', async () => {
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
    dataService.getAllSchools = jest.fn(async () => {
      return schools
    })
    let update: SchoolPinUpdate | undefined
    dataService.updatePin = jest.fn(async (schoolUpdate) => {
      update = schoolUpdate
    })
    await sut.process(logger)
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
    expect(update).toBeDefined()
    // optional chaining not currently supported in our ts-jest setup
    expect(update ? update.id : undefined).toEqual(2)
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
    dataService.getAllSchools = jest.fn(async () => {
      return schools
    })
    dataService.updatePin = jest.fn(async (schoolUpdate) => {
      throw new Error('mock error')
    })
    await sut.process(logger)
    expect(dataService.updatePin).toHaveBeenCalledTimes(new ConfigFileProvider().PinUpdateMaxAttempts)
  })

  test('if no schools to process, service returns early', async () => {
    dataService.getAllSchools = jest.fn(async () => {
      return []
    })
    await sut.process(logger)
    expect(dataService.updatePin).not.toHaveBeenCalled()
  })

  test('only updates single school specified when schoolUUID passed as param', async () => {
    dataService.getSchoolByUuid = jest.fn(async (uuid: string) => {
      const school: School = {
        id: 1,
        name: 'x'
      }
      return school
    })
    const schoolUuid = uuid.v4()
    await sut.process(logger, schoolUuid)
    expect(dataService.getSchoolByUuid).toHaveBeenCalledTimes(1)
    expect(dataService.updatePin).toHaveBeenCalledTimes(1)
  })
})
