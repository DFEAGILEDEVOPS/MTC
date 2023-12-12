import AdmZip from 'adm-zip'
import { JobDataService, type IJobData } from './data-access/job.data.service'
const dateService = require('../date.service')

export interface ICreatedJob {
  jobUuid: string
}

export enum JobStatus {
  Submitted = 'SUB',
  Processing = 'PRC',
  CompletedSuccessfully = 'COM',
  CompletedWithErrors = 'CWR',
  Failed = 'FLD',
  Deleted = 'DEL'
}

export enum JobType {
  PupilCensus = 'CEN',
  PsychometricianReport = 'PSY',
  OrganisationFileUpload = 'ORG'
}

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

  public static async getJobOutputs (jobSlug: string): Promise<Buffer | undefined> {
    const data = await JobDataService.getJobOutput(jobSlug)
    if (data === undefined) return undefined
    const zipFile = new AdmZip()
    const output = data.output ?? ''
    const errorInfo = data.errorInfo ?? ''
    zipFile.addFile('output.txt', Buffer.from(output))
    zipFile.addFile('error.txt', Buffer.from(errorInfo))
    return zipFile.toBuffer()
  }

  public static async createJob (jobInput: string, jobType: JobType, status: JobStatus): Promise<ICreatedJob> {
    const response = await JobDataService.createJob(jobInput, status, jobType)
    return {
      jobUuid: response.urlSlug
    }
  }
}
