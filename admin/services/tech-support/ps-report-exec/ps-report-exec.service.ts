import { PsReportExecDataService } from './ps-report-exec.data.service'
import { JobService, JobStatus, JobType } from '../../job/job.service'
const dateService = require('../../date.service')

export class PsReportExecService {
  public static async requestReportGeneration (currentUserId: number): Promise<any> {
    if (currentUserId < 1) {
      throw new Error('currentUserId must be greater than zero')
    }
    const userInfo = await PsReportExecDataService.getUserInfo(currentUserId)
    const requestorDetails = `${userInfo?.displayName} (${userInfo?.identifier})`
    const job = await JobService.createJob(`requested by ${requestorDetails}`, JobType.PsychometricianReport, JobStatus.Submitted)
    return PsReportExecDataService.sendPsReportExecMessage({
      dateTimeRequested: dateService.utcNowAsMoment(),
      jobUuid: job.jobUuid,
      requestedBy: requestorDetails
    })
  }
}
