import { IPsReportLogFileData, PsReportLogsDataService } from './data-access/ps-report-logs.data.service'
import { IPsReportLogFile, PsReportLogsDownloadService } from './ps-report-logs.service'


describe('ps report logs service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getLogFoldersList', () => {
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
      const actualContainerList = await PsReportLogsDownloadService.getLogFoldersList()
      expect(actualContainerList).toHaveLength(expectedLength)
      for (let index = 0; index < actualContainerList.length; index++) {
        const container = actualContainerList[index]
        expect(container.startsWith(correctPrefix)).toBe(true)
      }
    })
  })

  describe('downloadLogFile', () => {
    test('throws error if fileName is empty', async () => {
      await expect(PsReportLogsDownloadService.downloadLogFile('container', '')).rejects.toThrow('fileName is required')
    })

    test('throws error if containerName is empty', async () => {
      await expect(PsReportLogsDownloadService.downloadLogFile('', 'fileName')).rejects.toThrow('containerName is required')
    })

    test('returns file contents as string when exists', async () => {
      const mockFileContents = 'yada-yada-yada-yada-yada'
      jest.spyOn(PsReportLogsDataService, 'getFileContents').mockResolvedValue(mockFileContents)
      await expect(PsReportLogsDownloadService.downloadLogFile('some container', 'somefile')).resolves.toBe(mockFileContents)
    })

    test('returns undefined when file specified does not exist', async () => {
      jest.spyOn(PsReportLogsDataService, 'getFileContents').mockResolvedValue(undefined)
      await expect(PsReportLogsDownloadService.downloadLogFile('some container', 'somefile')).resolves.toBe(undefined)
    })
  })

  describe('getLogFolderFileList', () => {
    test('raw file length sizes are converted to meaningful MB summaries', async () => {
      const rawData: Array<IPsReportLogFileData> = [{
        name: 'myfile.txt',
        byteLength: 1048576
      }]
      jest.spyOn(PsReportLogsDataService, 'getContainerFileList').mockResolvedValue(rawData)
      const entries = await PsReportLogsDownloadService.getLogFolderFileList('myContainer')
      expect(entries).toHaveLength(1)
      expect(entries[0].name).toStrictEqual(rawData[0].name)
      expect(entries[0].size).toStrictEqual('1.0MB')
    })
  })
})
