import { PsReportLogsDataService } from './data-access/ps-report-logs.data.service'
import { PsReportLogsDownloadService } from './ps-report-logs.service'


describe('ps report logs service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('it only returns containers that are prefixed with the correct name', async () => {
    const correctPrefix = 'ps-report-log-'
    const allContainers = [
      'some-container',
      'ps-report-log-9494949494',
      'ps-rep-testing',
      'data-uploads',
      'ps-report-log-939322332344545-x',
      'ps-report-log9999999',
      'ps-report-log-9999999'
    ]
    jest.spyOn(PsReportLogsDataService, 'getContainerList').mockResolvedValue(allContainers)
    const expectedLength = 3
    const actualContainerList = await PsReportLogsDownloadService.getDownloadList()
    expect(actualContainerList).toHaveLength(expectedLength)
    for (let index = 0; index < actualContainerList.length; index++) {
      const container = actualContainerList[index]
      expect(container.startsWith(correctPrefix)).toBe(true)
    }
  })
})
