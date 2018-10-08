const winston = require('winston')
const { TYPES } = require('tedious')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')

const passwordHash = "$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK";

async function main () {
  
  try {
    
    const schools = await sqlService.query(`SELECT * FROM school`)
    let i = 0; const numSchools = schools.length; 

    winston.info(`${numSchools} schools`)

    for(; i < numSchools; i++) {
    
      let school = schools[i]
      let teacherIdentifier = 'teacher' + (i+1)
      
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
        },
        {
          name: 'teacherIdentifier',
          value: teacherIdentifier,
          type: TYPES.NVarChar
        }
      ]

      const sql = `
        INSERT INTO ${sqlService.adminSchema}.[user] (identifier, passwordHash, school_id, role_id)
        VALUES (@teacherIdentifier, @passwordHash, @schoolId, 3)
      `

      try {

        await sqlService.query(sql, params)

      } catch(error) {
        
        // Catch unique contraint errors
        // We need to do this because a user with the identifier
        // might exist in the db and we cant remove them.
        // This makes the assumtion that the existing users
        // password is a hash of 'password' and we can't be sure
        // there is 1 user per school
        if(error.number !== 2627) {
          throw error;
        }
      }
    }
    
    winston.info('Done')
    sqlPoolService.drain()
    
  } catch (error) {

    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

main()
