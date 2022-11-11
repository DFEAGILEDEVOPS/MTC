import { PsReportExecDataService } from './ps-report-exec.data.service'

export class PsReportExecService {
  public static async requestReportGeneration (currentUserId: number): Promise<any> {
    if (currentUserId < 1) {
      throw new Error('currentUserId must be greater than zero')
    }
    const userInfo = PsReportExecDataService.getUserInfo(currentUserId)
    return userInfo
  }
}
