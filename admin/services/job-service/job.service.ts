import AdmZip from 'adm-zip'
import { JobDataService, IJobData } from './data-access/job.data.service'
const dateService = require('../date.service')

export class JobService {
  public static async getJobSummary (): Promise<IJobData[]> {
    const jobs = await JobDataService.getJobs()
    return jobs.map(o => {
      return {
        createdAt: dateService.formatDateAndTime(o.createdAt),
        urlSlug: o.urlSlug,
        status: o.status,
        type: o.type
      }
    })
  }

  public static async getJobOutputs (jobSlug: string): Promise<Buffer> {
    const data = await JobDataService.getJobOutput(jobSlug)
    if (data === undefined) return undefined
    const zipFile = new AdmZip()
    let output = data.output ?? ''
    let errorInfo = data.errorInfo ?? ''
    zipFile.addFile('output.txt', Buffer.from(output))
    zipFile.addFile('error.txt', Buffer.from(errorInfo))
    return zipFile.toBuffer()
  }
}