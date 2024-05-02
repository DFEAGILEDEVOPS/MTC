import { PsReportExecDataService } from './ps-report-exec.data.service'
import { JobService, JobStatus, JobType } from '../../job/job.service'
const dateService = require('../../date.service')

export class PsReportExecService {
  public static async requestReportGeneration (currentUserId: number, urnCsvList?: string): Promise<any> {
    if (currentUserId < 1) {
      throw new Error('currentUserId must be greater than zero')
    }
    const urns = new Array<number>()
    if (urnCsvList !== undefined && urnCsvList.length > 0) {
      if (urnCsvList.includes(',') === false) {
        urns.push(parseInt(urnCsvList.trim(), 10))
      } else {
        const listParts = urnCsvList.split(',')
        const numberRegex = /^\d+$/
        for (let urn of listParts) {
          if (!urn) {
            throw new Error('Invalid URN')
          }
          urn = urn.trim()
          if (!urn.match(numberRegex)) {
            throw new Error(`Invalid URN: ${urn}`)
          }
          urns.push(parseInt(urn, 10))
        }
      }
    }
    const userInfo = await PsReportExecDataService.getUserInfo(currentUserId)
    const requestorDetails = `${userInfo?.displayName} (${userInfo?.identifier})`
    const job = await JobService.createJob(`requested by ${requestorDetails}`, JobType.PsychometricianReport, JobStatus.Submitted)
    return PsReportExecDataService.sendPsReportExecMessage({
      dateTimeRequested: dateService.utcNowAsMoment(),
      jobUuid: job.jobUuid,
      requestedBy: requestorDetails,
      urns: urns.length > 0 ? urns : undefined
    })
  }
}
