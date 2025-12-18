import { PsReportService } from './ps-report.service'
import { type ILogger, MockLogger } from '../../common/logger'
import { type IPsReportDataService } from './ps-report.data.service'
import { type IOutputBinding } from '.'
import { type PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'

describe('PsReportService', () => {
  let sut: PsReportService
  let logger: ILogger
  let psReportDataService: IPsReportDataService
  const schoolUuid = 'AAAA-BBBB-CCCC-DDDD'
  const outputBindings: IOutputBinding = { psReportExportOutput: [] }
  const mockPupils = [{ id: 1, schoolId: 99 }, { id: 2, schoolId: 99 }, { id: 3, schoolId: 99 }]
  const mockSchool = { id: 99, name: 'test school' }
  const psReportSchoolFanOutMessage: PsReportSchoolFanOutMessage = {
    uuid: schoolUuid,
    name: mockSchool.name,
    jobUuid: 'job-uuid',
    filename: 'somefile.data',
    totalNumberOfSchools: 5
  }

  beforeEach(() => {
    logger = new MockLogger()
    psReportDataService = {
      getPupilData: jest.fn(),
      getPupils: jest.fn(),
      getSchool: jest.fn()
    }
    outputBindings.psReportExportOutput = []

    sut = new PsReportService(logger, psReportDataService)
  })

  test('it is defined', () => {
    expect(sut).toBeDefined()
  })

  test('it makes a call to get pupils for a school', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce(mockPupils)
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(psReportSchoolFanOutMessage)
    expect(psReportDataService.getPupils).toHaveBeenCalledWith(schoolUuid)
  })

  test('it makes a call to get the school', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce(mockPupils)
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(psReportSchoolFanOutMessage)
    expect(psReportDataService.getSchool).toHaveBeenCalledWith(99)
  })

  test('it throws if the call to getPupils throws', async () => {
    (psReportDataService.getPupils as jest.Mock).mockRejectedValueOnce(new Error('mock error'))
    await expect(sut.process(psReportSchoolFanOutMessage)).rejects.toThrow('mock error')
  })

  test('it calls getPupilData() once per pupil received', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    await sut.process(psReportSchoolFanOutMessage)
    expect(psReportDataService.getPupilData).toHaveBeenCalledTimes(3)
  })

  test('it returns failure counts when processing completes', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1, slug: 'pupil-1' }, { id: 2, slug: 'pupil-2' }])
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    ;(psReportDataService.getPupilData as jest.Mock).mockResolvedValue({
      pupil: { id: 1 },
      school: mockSchool,
      check: null,
      checkConfig: null,
      checkForm: null,
      answers: null,
      device: null,
      events: null,
      inputAssistant: null
    })
    const result = await sut.process(psReportSchoolFanOutMessage)
    expect(result).toHaveProperty('successfulPupilCount')
    expect(result).toHaveProperty('failedPupilCount')
    expect(result).toHaveProperty('psReportExportOutput')
  })

  test('it handles zero pupils gracefully', async () => {
    ;(psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([])
    const result = await sut.process(psReportSchoolFanOutMessage)
    expect(result.successfulPupilCount).toBe(0)
    expect(result.failedPupilCount).toBe(0)
    expect(result.psReportExportOutput).toHaveLength(0)
    expect(psReportDataService.getSchool).not.toHaveBeenCalled()
  })

  test.skip('it outputs the results from getPupilData() once per pupil onto the outputBinding', async () => {
    (psReportDataService.getPupils as jest.Mock).mockResolvedValueOnce([{ id: 1 }, { id: 2 }, { id: 3 }])
    ;(psReportDataService.getSchool as jest.Mock).mockResolvedValueOnce(mockSchool)
    ;(psReportDataService.getPupilData as jest.Mock)
      .mockResolvedValueOnce({ data: 1 })
      .mockResolvedValueOnce({ data: 2 })
      .mockResolvedValueOnce({ data: 3 })
    await sut.process(psReportSchoolFanOutMessage)
    expect(outputBindings.psReportExportOutput).toHaveLength(3)
  })
})
