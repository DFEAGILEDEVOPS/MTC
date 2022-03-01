import { isNumber } from 'ramda-adjunct'
import { JobDataService, IJobData, IJobOutput } from './data-access/job.data.service'

export class JobService {
  public static async getJobSummary () {
    return JobDataService.getJobs()
  }

  public static async getJobOutputs (jobId: number) {
    return JobDataService.getJobOutput(jobId)
  }
}
