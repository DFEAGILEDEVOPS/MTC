import { PsReportLogsDataService } from './data-access/ps-report-logs.data.service'
import * as R from 'ramda'

export class PsReportLogsDownloadService {
  public static async getDownloadList (): Promise<Array<string>> {
    const containers = await PsReportLogsDataService.getContainerList()
    const hasCorrectPrefix = c => c.startsWith('ps-report-log-')
    return R.filter(hasCorrectPrefix, containers)
  }

  public static async downloadLogFile (containerName: string, fileName: string): Promise<string | undefined> {
    if (fileName.length === 0) {
      throw new Error('fileName is required')
    }
    if (containerName.length === 0) {
      throw new Error('containerName is required')
    }
    return PsReportLogsDataService.getFileContents(containerName, fileName)
  }
}
