/* eslint-disable @typescript-eslint/dot-notation */

import { SchoolResultsCacheDeterminerService } from './school-results-cache-determiner.service'
import { ConsoleLogger, type ILogger } from '../../common/logger'
import config from '../../config'
import moment from 'moment'

const schoolData = [
  { schoolName: 'Test school 1', schoolGuid: 'abc-123' },
  { schoolName: 'Test school 2', schoolGuid: 'abc-124' },
  { schoolName: 'Test school 3', schoolGuid: 'abc-125' }
]

let mockDataService: any

interface IMockContext {
  bindings: Record<string, unknown>
  log: ILogger
}

function getMockContext (): IMockContext {
  const functionBindings: any = {}
  const context = {
    bindings: functionBindings,
    log: new ConsoleLogger()
  }
  return context
}

describe('school-results-cache-determiner.service', () => {
  let sut: SchoolResultsCacheDeterminerService

  beforeAll(() => {
    // This function is a little wordy for unit tests
    jest.spyOn(console, 'error').mockImplementation()
    jest.spyOn(console, 'warn').mockImplementation()
    jest.spyOn(console, 'info').mockImplementation()
    jest.spyOn(console, 'log').mockImplementation()
  })

  beforeEach(() => {
    mockDataService = {
      sqlFindActiveCheckWindow: jest.fn(),
      sqlGetSchoolGuids: jest.fn(async () => {
        return schoolData
      })
    }
  })

  test('it is defined', () => {
    const mockContext = getMockContext()
    sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    expect(sut).toBeDefined()
  })

  test('no schools are cached when the config is set to 0', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    config.SchoolResultsCacheDeterminer.cache = 0

    await sut.execute()

    expect(mockContext.bindings).toStrictEqual({})
    expect(mockDataService.sqlGetSchoolGuids).not.toHaveBeenCalled()
  })

  test('it sends messages to cache all schools when the config is set to 2', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    config.SchoolResultsCacheDeterminer.cache = 2

    await sut.execute()
    expect('schoolResultsCache' in mockContext.bindings).toBeDefined()
    expect(mockContext.bindings.schoolResultsCache).toHaveLength(3)
    expect(mockContext.bindings.schoolResultsCache).toStrictEqual(schoolData)
  })

  test('it does not send any messages to cache schools when the config is set to 1 (default) but the datetime is too early', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    config.SchoolResultsCacheDeterminer.cache = 1

    // mock the checkWindow with known checkStart and and checkEnd dates
    mockDataService.sqlFindActiveCheckWindow.mockImplementation(() => {
      return {
        id: 1,
        name: 'Test check window',
        adminStartDate: moment('2020-04-01'),
        checkStartDate: moment('2020-06-01'),
        checkEndDate: moment('2020-07-31'),
        isDeleted: false,
        urlSlug: 'e471f3f2-3507-4c28-a136-759a2e54ca97',
        adminEndDate: moment('2020-09-31')
      }
    })
    // mock the system date to be within the admin period, but outside the check start date
    jest.spyOn(Date, 'now').mockImplementation(() => new Date('2020-05-15T09:00:00.000Z').getTime())

    await sut.execute()

    // Expect no output messages at this time
    expect(mockContext.bindings).toStrictEqual({})
  })

  test('it does not send any messages to cache schools when the config is set to 1 (default) but the datetime is too late', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    config.SchoolResultsCacheDeterminer.cache = 1

    // first, mock the checkWindow with known checkStart and and checkEnd dates
    mockDataService.sqlFindActiveCheckWindow.mockImplementation(() => {
      return {
        id: 1,
        name: 'Test check window',
        adminStartDate: moment('2020-04-01'),
        checkStartDate: moment('2020-06-01'),
        checkEndDate: moment('2020-07-31'),
        isDeleted: false,
        urlSlug: 'e471f3f2-3507-4c28-a136-759a2e54ca97',
        adminEndDate: moment('2020-09-31')
      }
    })

    // second, mock the system date to be within the admin period, but outside the check start date
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2020-08-03T07:00:00.001').getTime()) // 1ms after it opens on the monday after

    await sut.execute()

    // Expect no output messages at this time
    expect(mockContext.bindings).toStrictEqual({})
  })

  test('it sends messages to cache schools when the config is set to 1 (default) and the date is between the live check close and the first monday after at 6am', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)
    config.SchoolResultsCacheDeterminer.cache = 1

    // first, mock the checkWindow with known checkStart and and checkEnd dates
    mockDataService.sqlFindActiveCheckWindow.mockImplementation(() => {
      return {
        id: 1,
        name: 'Test check window',
        adminStartDate: moment('2020-04-01'),
        checkStartDate: moment('2020-06-01'),
        checkEndDate: moment('2020-07-31'),
        isDeleted: false,
        urlSlug: 'e471f3f2-3507-4c28-a136-759a2e54ca97',
        adminEndDate: moment('2020-09-31')
      }
    })
    mockDataService.sqlGetSchoolGuids.mockImplementation(async () => {
      return schoolData
    })

    // second, mock the system date to be within the admin period, but outside the check start date
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2020-07-31T22:00:00.000Z').getTime())

    await sut.execute()

    // Expect 3 output bindings
    expect(mockContext.bindings.schoolResultsCache).toHaveLength(3)
    expect(mockContext.bindings.schoolResultsCache).toStrictEqual(schoolData)
  })

  test('it throws an error if the schools object is not an array', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)

    // we need to set this up so that it attempts to send the messages, otherwise addMessagesToSchoolResultsCacheQueue() will not
    // be called.
    config.SchoolResultsCacheDeterminer.cache = 2 // always send messages

    // set up the non-array return value, in this case `undefined`
    mockDataService.sqlGetSchoolGuids.mockReturnValue(undefined)

    try {
      await sut.execute()
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('schools is not an array')
    }
  })

  test('if an unknown config value is provided it calls `dateRangeCheckAndCache()`', async () => {
    const mockContext = getMockContext()
    const sut = new SchoolResultsCacheDeterminerService(mockContext.bindings, mockContext.log, mockDataService)

    // Set up an unknown config value
    config.SchoolResultsCacheDeterminer.cache = 42 // we don't know what this means

    // Mock and the spy on the internal call - no need to execute it, because then we need to start mocking the date, which is irrelevent
    // as all we are really testing here is the default case of the switch statement.
    // eslint-disable-next-line jest/prefer-spy-on
    sut['dateRangeCheckAndCache'] = jest.fn()

    await sut.execute()

    expect(sut['dateRangeCheckAndCache']).toHaveBeenCalledWith() // testing a private method, so object/property syntax
  })
})
