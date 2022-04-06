import { PsReportLogsDownloadService } from './ps-report-logs.service'

let sut: PsReportLogsDownloadService

describe('ps report logs service', () => {
  beforeEach(() => {
    sut = new PsReportLogsDownloadService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })
})
