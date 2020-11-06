import { ISyncResultsDataService, SyncResultsDataService } from './sync-results.data.service'
import { ISqlService } from '../../sql/sql.service'
import { IPrepareEventService } from './prepare-event.service'
import { IPrepareAnswersAndInputsDataService } from './prepare-answers-and-inputs.data.service'
import { TYPES } from 'mssql'

const mockQuestionData = new Map()
mockQuestionData.set('1x1', { id: 1, factor1: 1, factor2: 2, isWarmup: false, code: 'Q001' })
let mockSqlService: ISqlService

describe('SyncResultsDataService', () => {
  let sut: ISyncResultsDataService
  let mockPrepareEventService: IPrepareEventService
  let mockPrepareAnswersAndInputsDataService: IPrepareAnswersAndInputsDataService

  beforeEach(() => {
    mockSqlService = {
      query: jest.fn(),
      modify: jest.fn(),
      modifyWithTransaction: jest.fn()
    }
    mockPrepareEventService = {
      prepareEvent: jest.fn()
    }
    mockPrepareAnswersAndInputsDataService = {
      prepareAnswersAndInputs: jest.fn()
    }
    sut = new SyncResultsDataService(mockSqlService, mockPrepareAnswersAndInputsDataService, mockPrepareEventService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('prepareEvents calls prepareEventService prepareEvent for each audit entry', async () => {
    jest.spyOn(mockPrepareEventService, 'prepareEvent').mockResolvedValue({ sql: '', params: [] })
    const mockMsg = {
      audit: [
        { type: 'unit1' },
        { type: 'unit2' },
        { type: 'unit3' }
      ]
    }
    // @ts-ignore: for testing purposes we are providing an minimal completed-check message object
    await sut.prepareEvents(mockMsg)
    expect(mockPrepareEventService.prepareEvent).toHaveBeenCalledTimes(3)
  })

  test('prepareEvents returns an ITransactionRequest built up from all the calls to prepareEvents', async () => {
    jest.spyOn(mockPrepareEventService, 'prepareEvent').mockResolvedValue({ sql: 'INSERT INTO mockTable (col) values (val);', params: [{ name: 'param1', value: 'unit-test', type: TYPES.NVarChar }] })
    const mockMsg = {
      audit: [
        { type: 'unit1' },
        { type: 'unit2' },
        { type: 'unit3' }
      ]
    }
    // @ts-ignore: for testing purposes we are providing an minimal completed-check message object
    const res = await sut.prepareEvents(mockMsg)
    expect(res.sql).toBe('INSERT INTO mockTable (col) values (val);\nINSERT INTO mockTable (col) values (val);\nINSERT INTO mockTable (col) values (val);')
    expect(res.params).toHaveLength(3)
  })

  describe('#prepareDeviceData', () => {
    const validatedCheck = {
      device: {
        battery: {
          isCharging: true,
          levelPercent: 89,
          chargingTime: 984,
          dischargingTime: 2999
        },
        cpu: {
          hardwareConcurrency: 4
        },
        navigator: {
          platform: 'OSChip',
          language: 'en_Testish',
          cookieEnabled: true,
          userAgent: 'Mozilla 1.0'
        },
        networkConnection: {
          downlink: 10,
          effectiveType: '4g',
          rtt: 83
        },
        screen: {
          screenWidth: 1024,
          screenHeight: 768,
          outerWidth: 1000,
          outerHeight: 750,
          innerWidth: 900,
          innerHeight: 720,
          colorDepth: 24,
          orientation: 'primary-landscape'
        },
        appUsageCounter: 3,
        deviceId: 'abc-def'
      },
      checkCode: 'code'
    }

    test('it picks the isCharging prop from the battery', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const isChargingParam = res.params.find(p => p.name === 'batteryIsCharging')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(isChargingParam.value).toBe(true)
    })

    test('it picks the levelPercent prop from the battery', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'batteryLevelPercent')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(89)
    })

    test('it picks the chargingTime prop from the battery', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'batteryChargingTimeSecs')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(984)
    })

    test('it picks the dischargingTime prop from the battery', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'batteryDischargingTimeSecs')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(2999)
    })

    test('it picks the hardwareConcurrency prop from the cpu', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'cpuHardwareConcurrency')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(4)
    })

    test('it picks the platform prop from the navigator', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'navigatorPlatform')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('OSChip')
    })

    test('it picks the language prop from the navigator', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'navigatorLanguage')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('en_Testish')
    })

    test('it picks the cookieEnabled prop from the navigator', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'cookieEnabled')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(true)
    })

    test('it picks the downlink prop from the networkConnection', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'networkConnectionDownlink')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(10)
    })

    test('it picks the effectiveType prop from the networkConnection', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'networkConnectionEffectiveType')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('4g')
    })

    test('it picks the rtt prop from the networkConnection', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'networkConnectionRoundTripTimeMs')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(83)
    })

    test('it picks the screenWidth prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'screenWidth')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(1024)
    })

    test('it picks the screenHeight prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'screenHeight')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(768)
    })

    test('it picks the outerWidth prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'outerWidth')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(1000)
    })

    test('it picks the outerHeight prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'outerHeight')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(750)
    })

    test('it picks the innerWidth prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'innerWidth')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(900)
    })

    test('it picks the innerHeight prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'innerHeight')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(720)
    })

    test('it picks the colorDepth prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'colourDepth')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(24)
    })

    test('it picks the orientation prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'deviceOrientation')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('primary-landscape')
    })

    test('it picks the appUsageCounter prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'appUsageCount')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe(3)
    })

    test('it picks the userAgent prop from the screen', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'userAgent')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('Mozilla 1.0')
    })

    test('it picks the deviceId prop from the root', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData(validatedCheck)
      const param = res.params.find(p => p.name === 'ident')
      // @ts-ignore ignore undefined for this test - test will fail
      expect(param.value).toBe('abc-def')
    })

    test('everything gets set to null if not present in the device', async () => {
      // @ts-ignore : minimal test object is not a real ValidatedCheck type
      const res = await sut.prepareDeviceData({})
      res.params.forEach(p => {
        expect(p.value).toBeNull()
      })
    })
  })

  describe('#prepareCheckResult', () => {
    const markedCheck = {
      mark: 21,
      markedAt: '2020-11-05T18:54:47.415Z'
    }

    test('it picks the mark', () => {
      // @ts-ignore minimal test
      const res = sut.prepareCheckResult(markedCheck)
      const param = res.params.find(p => p.name === 'mark')
      // @ts-ignore minimal test
      expect(param.value).toBe(21)
    })

    test('it picks the markedAt prop', () => {
      // @ts-ignore minimal test
      const res = sut.prepareCheckResult(markedCheck)
      const param = res.params.find(p => p.name === 'markedAt')
      // @ts-ignore minimal test
      expect((new Date(param.value)).toISOString()).toBe('2020-11-05T18:54:47.415Z')
    })
  })

  describe('#prepareAnswersAndInputs', () => {
    test('it calls the appropriate data service', async () => {
      // @ts-ignore - minimal test, checking a mocked method is called
      await sut.prepareAnswersAndInputs({}, {})
      expect(mockPrepareAnswersAndInputsDataService.prepareAnswersAndInputs).toHaveBeenCalledWith({}, {})
    })
  })

  describe('#insertToDatabase', () => {
    test('it calls the appropriate data service', async () => {
      await sut.insertToDatabase([{ sql: '', params: [] }])
      expect(mockSqlService.modifyWithTransaction).toHaveBeenCalledWith([{ sql: '', params: [] }])
    })
  })
})
