import { PsReportLogsDataService } from './data-access/ps-report-logs.data.service'
import * as R from 'ramda'
import XRegExp from 'xregexp'

export class PsReportLogsDownloadService {
  private static readonly logFolderPrefix = 'ps-report-log-'
  private static readonly textFileRegex: string = '[a-zA-Z0-9]*.txt'
  private static readonly logContainerNameRegex: string = `${PsReportLogsDownloadService.logFolderPrefix}[0-9]{14}$`

  public static async getLogFoldersList (): Promise<string[]> {
    const containers = await PsReportLogsDataService.getContainerList()
    const hasCorrectPrefix = (c: string): boolean => c.startsWith(this.logFolderPrefix)
    return R.filter(hasCorrectPrefix, containers).sort().reverse()
  }

  public static async getLogFolderFileList (containerName: string): Promise<IPsReportLogFile[]> {
    if (containerName.length === 0) {
      throw new Error('containerName is required')
    }
    if (!XRegExp(this.logContainerNameRegex).test(containerName)) {
      throw new Error('incorrect container name format')
    }

    const data = await PsReportLogsDataService.getContainerFileList(containerName)
    return data.map(d => {
      return {
        name: d.name,
        size: this.bytesToSize(d.byteLength)
      }
    })
  }

  public static async downloadLogFile (containerName: string, fileName: string): Promise<string | undefined> {
    if (containerName.length === 0) {
      throw new Error('containerName is required')
    }
    if (!XRegExp(this.logContainerNameRegex).test(containerName)) {
      throw new Error('incorrect container name format')
    }
    if (fileName.length === 0) {
      throw new Error('fileName is required')
    }
    if (!XRegExp(this.textFileRegex).test(fileName)) {
      throw new Error('incorrect file name format')
    }
    return PsReportLogsDataService.getFileContents(containerName, fileName)
  }

  private static bytesToSize (bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return 'n/a'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    if (i === 0) return bytes.toString() + ' ' + sizes[i]
    return (bytes / Math.pow(1024, i)).toFixed(2) + sizes[i]
  }
}

export interface IPsReportLogFile {
  name: string
  size: string
}
