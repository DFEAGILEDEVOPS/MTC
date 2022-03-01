import AdmZip from 'adm-zip'
import { JobDataService, IJobData } from './data-access/job.data.service'

export class JobService {
  public static async getJobSummary (): Promise<IJobData[]> {
    return JobDataService.getJobs()
  }

  public static async getJobOutputs (jobId: number): Promise<Buffer> {
    const data = await JobDataService.getJobOutput(jobId)
    const zip = new AdmZip()
    if (data === undefined) return undefined
    let output = data.output ?? ''
    let errorInfo = data.errorInfo ?? ''
    zip.addFile('output.txt', Buffer.from(output))
    zip.addFile('error.txt', Buffer.from(errorInfo))
    return zip.toBuffer()
  }
}
