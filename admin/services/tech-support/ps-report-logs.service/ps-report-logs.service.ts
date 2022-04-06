export class PsReportLogsDownloadService {
  public static async getDownloadList (): Promise<IPsReportLogDownloadItem> {
    throw new Error('not implemented')
  }
}

export interface IPsReportLogDownloadItem {
  name: string
}
