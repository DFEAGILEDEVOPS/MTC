'use strict'

const schoolSummaryService = require('../../../services/school-summary.service')
const schoolSummaryDataService = require('../../../services/data-access/school-summary.data.service')

describe('schoolSummaryService', () => {
  const mockRegisterData = {
    Completed: 5
  }
  const mockLiveData = [
    {
      Date: '5th July',
      PinsGenerated: 3,
      LoggedIn: 1,
      Complete: 2
    },
    {
      Date: '4th April',
      PinsGenerated: 10,
      LoggedIn: 3,
      Complete: 6
    }
  ]
  const mockTioData = [
    {
      Date: '5th July',
      PinsGenerated: 3,
      LoggedIn: 2
    },
    {
      Date: '1st July',
      PinsGenerated: 7,
      LoggedIn: 5
    }
  ]
  beforeEach(() => {
    jest.spyOn(schoolSummaryDataService, 'getRegisterData').mockResolvedValue(mockRegisterData)
    jest.spyOn(schoolSummaryDataService, 'getLiveCheckData').mockResolvedValue(mockLiveData)
    jest.spyOn(schoolSummaryDataService, 'getTryItOutCheckData').mockResolvedValue(mockTioData)
  })

  test('should be defined', async () => {
    expect(schoolSummaryService).toBeDefined()
  })

  test('should transform register data correctly', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    expect(summary.register.total).toBe(mockRegisterData.TotalCount)
  })

  test('should transform live check data correctly', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    const liveCheck1 = summary.liveCheckSummary[0]
    const mockLiveCheck1 = mockLiveData[0]
    expect(liveCheck1.Date).toBe(mockLiveData[0].Date)
    expect(liveCheck1.PinsGenerated).toBe(mockLiveCheck1.PinsGenerated)
    expect(liveCheck1.LoggedIn).toBe(mockLiveCheck1.LoggedIn)
    expect(liveCheck1.Complete).toBe(mockLiveCheck1.Complete)

    const liveCheck2 = summary.liveCheckSummary[1]
    const mockLiveCheck2 = mockLiveData[1]
    expect(liveCheck2.Date).toBe(mockLiveCheck2.Date)
    expect(liveCheck2.PinsGenerated).toBe(mockLiveCheck2.PinsGenerated)
    expect(liveCheck2.LoggedIn).toBe(mockLiveCheck2.LoggedIn)
    expect(liveCheck2.Complete).toBe(mockLiveCheck2.Complete)
  })

  test('should transform tio check data correctly', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    const tioCheck1 = summary.tioCheckSummary[0]
    const mockTioCheck1 = mockTioData[0]
    expect(tioCheck1.Date).toBe(mockLiveData[0].Date)
    expect(tioCheck1.PinsGenerated).toBe(mockTioCheck1.PinsGenerated)
    expect(tioCheck1.LoggedIn).toBe(mockTioCheck1.LoggedIn)

    const tioCheck2 = summary.tioCheckSummary[1]
    const mockTioCheck2 = mockTioData[1]
    expect(tioCheck2.Date).toBe(mockTioCheck2.Date)
    expect(tioCheck2.PinsGenerated).toBe(mockTioCheck2.PinsGenerated)
    expect(tioCheck2.LoggedIn).toBe(mockTioCheck2.LoggedIn)
  })
})
