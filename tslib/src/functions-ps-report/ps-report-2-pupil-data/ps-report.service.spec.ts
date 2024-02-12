import { PsReportService } from './ps-report.service'
import { type ILogger, MockLogger } from '../../common/logger'
import { type IPsReportDataService } from './ps-report.data.service'
import { type IMultipleOutputBinding } from '.'

describe('PsReportService', () => {
  let sut: PsReportService
  let logger: ILogger
  let psReportDataService: IPsReportDataService
  const schoolUuid = 'AAAA-BBBB-CCCC-DDDD'
  const outputBindings: IMultipleOutputBinding = { psReportPupilMessage: [], psReportStagingStart: null }
  const mockPupils = [{ id: 1, schoolId: 99 }, { id: 2, schoolId: 99 }, { id: 3, schoolId: 99 }]
  const mockSchool = { id: 99, name: 'test school' }

  beforeEach(() => {
    logger = new MockLogger()
    psReportDataService = {
      getPupilData: jest.fn(),
      getPupils: jest.fn(),
      getSchool: jest.fn(),
      getTotalPupilCount: jest.fn()
    }
    outputBindings.psReportPupilMessage = []
    outputBindings.psReportStagingStart = null
    sut = new PsReportService(outputBindings, logger, psReportDataService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it makes a call to get pupils for a school', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce(mockPupils)
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(schoolUuid)
    expect(psReportDataService.getPupils).toHaveBeenCalledWith(schoolUuid)
  })

  test('it makes a call to get the school', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce(mockPupils)
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(schoolUuid)
    expect(psReportDataService.getSchool).toHaveBeenCalledWith(99)
  })

  test('it throws if the call to getPupils throws', async () => {
    (psReportDataService.getPupils as jest.Mock).mockRejectedValueOnce(new Error('mock error'))
    await expect(sut.process(schoolUuid)).rejects.toThrow('mock error')
  })

  test('it calls getPupilData() once per pupil received', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(schoolUuid)
    expect(psReportDataService.getPupilData).toHaveBeenCalledTimes(3)
  })

  test('it outputs the results from getPupilData() once per pupil onto the outputBinding', async () => {
    (psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    ;(psReportDataService.getPupilData as jest.Mock)
      .mockResolvedValueOnce({ data: 1 })
      .mockResolvedValueOnce({ data: 2 })
      .mockResolvedValueOnce({ data: 3 })
    await sut.process(schoolUuid)
    expect(outputBindings.psReportPupilMessage).toHaveLength(3)
  })
})
