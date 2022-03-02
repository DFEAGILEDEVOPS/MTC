import AdmZip from 'adm-zip'
import { JobDataService, IJobData } from './data-access/job.data.service'

export class JobService {
  public static async getJobSummary (): Promise<IJobData[]> {
    return JobDataService.getJobs()
  }

  public static async getJobOutputs (jobId: number): Promise<Buffer> {
    const data = await JobDataService.getJobOutput(jobId)
    if (data === undefined) return undefined
    const zipFile = new AdmZip()
    let output = data.output ?? ''
    let errorInfo = data.errorInfo ?? ''
    zipFile.addFile('output.txt', Buffer.from(output))
    zipFile.addFile('error.txt', Buffer.from(errorInfo))
    return zipFile.toBuffer()
  }
}
