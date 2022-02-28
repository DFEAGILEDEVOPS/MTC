'use strict'

const service = {
  getJobOutputs: async function getJobOutputs (jobId) {
    return 'slkfjsdklfjsdlkfjsdklfjlksdfjkldsjflskdfj'
  },

  getJobSummary: async function getJobSummary () {
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
}

module.exports = service
