const winston = require('winston')
const fs = require('fs-extra')
const sqlService = require('../../admin/services/data-access/sql.service')

async function main () {
  try {
    winston.info('Deleting all pupil logon events...')
    const query1 = `DELETE FROM ${sqlService.adminSchema}.pupilLogonEvent`
    await sqlService.query(query1, [])
    winston.info('Deleting all pupil checks...')
    const query2 = `DELETE FROM ${sqlService.adminSchema}.check WHERE pupil_id > 2`
    await sqlService.query(query2, [])
    winston.info('Deleting all pupil answers...')
    const query3 = `DELETE FROM ${sqlService.adminSchema}.answer`
    await sqlService.query(query3, [])
    winston.info('Deleting all test generated pupils...')
    const query4 = `DELETE FROM ${sqlService.adminSchema}.pupil
    WHERE school_id > 6`
    await sqlService.query(query4, [])
    winston.info('Deleting all test generated schools...')
    const query5 = `DELETE FROM ${sqlService.adminSchema}.school
    WHERE urn > 89005`
    await sqlService.query(query5, [])
    winston.info('Deleting generated HTML reports directory and csv file...')
    // This can be dynamic if required
    await fs.remove('../Jmeter/reports/PupilHTMLReports')
    await fs.remove('../Jmeter/reports/pupil-performance-test.csv')
    winston.info('DONE')
    process.exit(0)
  } catch (error) {
    winston.info(error)
    process.exit(1)
  }
}

main()
