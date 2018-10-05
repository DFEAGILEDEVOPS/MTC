const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const converter = require('number-to-words')
const R = require('ramda')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')
const userDataService = require('../../admin/services/data-access/user.data.service')
const schoolDataService = require('../../admin/services/data-access/school.data.service')
const pupilDataService = require('../../admin/services/data-access/pupil.data.service')
const pinGenerationService = require('../../admin/services/pin-generation.service')
const checkStartService = require('../../admin/services/check-start.service')

const passwordHash = "$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK";
const deleteTeachersSql = "DELETE FROM user WHERE role_id"


async function main () {

  try {

    const teacherLength = parseInt(process.argv[2])

    if (!teacherLength) {
      throw new Error('Teacher length argument is not supplied or is not a valid number')
    }
  
    const schools = await sqlService.query(`SELECT * FROM school`)
    let i = 0; const numSchools = schools.length; 

    winston.info(`${numSchools} schools`)
    winston.info('Generating ${teacherLength} teachers per school...')

    for(; i < numSchools; i++) {

      let school = schools[i]
      // maybe use sqlService.generateParams
      let params = [
        {
          name: 'schoolId',
          value: school.id,
          type: TYPES.Int
        },
        {
          name: 'passwordHash',
          value: passwordHash,
          type: TYPES.NVarChar
        }
      ]
      const sql = `
        DECLARE @cnt INT = 1;
        WHILE @cnt <= 2
        BEGIN
            IF NOT EXISTS (SELECT * FROM ${sqlService.adminSchema}.[user]
                WHERE identifier = 'teacher'+CAST(@cnt AS NVARCHAR))
            BEGIN
                INSERT INTO ${sqlService.adminSchema}.[user] (identifier, passwordHash, school_id, role_id)
                VALUES ('teacher'+CAST(@cnt AS NVARCHAR), @passwordHash, @schoolId, 3)
                SET @cnt = @cnt + 1;
            END
        END`
      
      await sqlService.query(sql, params)

    }
    
    winston.info('DONE')
    sqlPoolService.drain()
    
  } catch (error) {
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

main()
