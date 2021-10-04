const sqlService = require('./sql.service')
const uuid = require('uuid')
const R = require('ramda')

const organisationBulkUploadDataService = {
  /**
   * Determine if an existing organisation upload job is running.
   * @returns {Promise<boolean>}
   */
  isExistingJob: async function isExistingJob () {
    const sql = `SELECT *
                   FROM mtc_admin.job j
                        join mtc_admin.jobType jt on (j.jobType_id = jt.id)
                        JOIN mtc_admin.jobStatus js on (j.jobStatus_id = js.id)
                  WHERE js.jobStatusCode IN ('SUB', 'PRC')
                    AND jt.jobTypeCode = 'ORG'`
    const jobs = await sqlService.query(sql)
    return jobs && jobs.length > 0
  },

  /**
   * Create a new job record for Organisation file upload
   * @returns {Promise<undefined | string>} The newly inserted ID of the job record
   */
  createJobRecord: async function createJobRecord () {
    if (await this.isExistingJob()) {
      throw new Error('A job is already running')
    }

    const sql = `
        INSERT INTO mtc_admin.job (jobStatus_id, jobType_id, jobInput)
        OUTPUT INSERTED.urlSlug
        VALUES ((SELECT id from mtc_admin.jobStatus where jobStatusCode = 'SUB'),
                (SELECT id from mtc_admin.jobType where jobTypeCode = 'ORG'),
                'File upload')
    `
    const retVal = await sqlService.query(sql)
    return retVal[0].urlSlug
  },

  /**
   * Return the job record by urlSlug
   * @param jobSlug
   * @returns {Promise<Object>}
   */
  sqlGetJobData: async function sqlGetJobData (jobSlug) {
    if (!uuid.validate(jobSlug)) {
      throw new Error(`Invalid UUID for jobSlug: ${jobSlug}`)
    }
    const sql = `
        SELECT j.*,                 
              jt.description as jobTypeDescription,
              jt.jobTypeCode,
              js.description as jobStatusDescription,
              js.jobStatusCode
          FROM mtc_admin.job j
               JOIN mtc_admin.jobType jt on (j.jobType_id = jt.id)
               JOIN mtc_admin.jobStatus js on (j.jobStatus_id = js.id) 
           AND jt.jobTypeCode = 'ORG' 
           AND j.urlSlug = @slug
    `
    const params = [
      { name: 'slug', value: jobSlug, type: sqlService.TYPES.UniqueIdentifier }
    ]
    const data = await sqlService.query(sql, params)
    return R.head(data)
  }
}

module.exports = organisationBulkUploadDataService
