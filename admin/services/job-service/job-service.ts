export class JobService {
  public static async getJobSummary () {
    return [
      {
        id: 1,
        jobType: 'census upload',
        createdAt: '2021-08-04 14:00',
        // startedAt: '2021-08-04 14:03',
        status: 'Complete',
        // completedAt: '2021-08-04 14:03',
        outputs: 'View'
      }
    ]
  }

  public static async getJobOutputs (jobId) {
    return `${jobId}skdfjdskjfsdkjfsdkjf`
  }
}
