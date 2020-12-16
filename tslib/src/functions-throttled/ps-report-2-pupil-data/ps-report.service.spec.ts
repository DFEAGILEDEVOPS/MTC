import { PsReportService } from './ps-report.service'
import { ILogger, MockLogger } from '../../common/logger'
import { IPsReportDataService } from './ps-report.data.service'

describe('PsReportService', () => {
  let sut: PsReportService
  let logger: ILogger
  let psReportDataService: IPsReportDataService
  const schoolUuid = 'AAAA-BBBB-CCCC-DDDD'
  let outputBindings: any[]

  beforeEach(() => {
    logger = new MockLogger()
    psReportDataService = {
      getPupils: jest.fn(),
      getPupilData: jest.fn()
    }
    outputBindings = []
    sut = new PsReportService(outputBindings, logger, psReportDataService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it makes a call to get pupils for a school', async () => {
    (psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    await sut.process(schoolUuid)
    expect(psReportDataService.getPupils).toHaveBeenCalledWith(schoolUuid)
  })

  test('it throws if the call to getPupils throws', async () => {
    (psReportDataService.getPupils as jest.Mock).mockRejectedValueOnce(new Error('mock error'))
    await expect(sut.process(schoolUuid)).rejects.toThrow('mock error')
  })

  test('it calls getPupilData() once per pupil received', async () => {
    (psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    await sut.process(schoolUuid)
    expect(psReportDataService.getPupilData).toHaveBeenCalledTimes(3)
  })

  test('it outputs the results from getPupilData() once per pupil onto the outputBinding', async () => {
    (psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    ;(psReportDataService.getPupilData as jest.Mock)
      .mockResolvedValueOnce({ data: 1 })
      .mockResolvedValueOnce({ data: 2 })
      .mockResolvedValueOnce({ data: 3 })
    await sut.process(schoolUuid)
    expect(outputBindings).toStrictEqual([{ data: 1 }, { data: 2 }, { data: 3 }])
  })
})
