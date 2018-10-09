const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')
const pupilDataService = require('../../admin/services/data-access/pupil.data.service')
const checkStartService = require('../../admin/services/check-start.service')

async function main () {
  try {
    const numPupils = parseInt(process.argv[2])
    if (!numPupils) {
      throw new Error('Pupil length argument is not supplied or is not a valid number')
    }

    let schools = await sqlService.query(`SELECT * FROM school`)
    let numSchools = schools.length
    let params

    let pupilsPerSchool = Math.round(numPupils / numSchools)
    if (pupilsPerSchool < 1) {
      pupilsPerSchool = 1
      schools = schools.slice(0, numPupils)
    }

    console.log(schools.length)

    winston.info(`Generating ${numPupils} pupils`)

    await Promise.all(schools.map(async school => {
      // maybe use sqlService.generateParams
      params = [
        {
          name: 'schoolId',
          value: school.id,
          type: TYPES.Int
        },
        {
          name: 'dateOfBirth',
          value: randomDob(),
          type: TYPES.DateTimeOffset
        }
      ]
      const sql = `
      BEGIN
        DECLARE @cnt INT = 1;
        DECLARE @baseUpn INT = 80120000 + @schoolId
        WHILE @cnt <= ${pupilsPerSchool}
        BEGIN
          BEGIN TRY
            INSERT ${sqlService.adminSchema}.[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
            VALUES (@schoolId, CAST(@cnt AS NVARCHAR), 'Pupil', 'M', @dateOfBirth, CAST(@baseUpn AS NVARCHAR) + CAST(@cnt AS NVARCHAR) + '1A')
          END TRY
          BEGIN CATCH
          END CATCH
          SET @cnt = @cnt + 1;
        END;
      END`
      await sqlService.query(sql, params)
      const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(school.dfeNumber)
      const pupilsList = pupils.map(p => p.id)
      await checkStartService.prepareCheck(pupilsList, school.dfeNumber, school.id)
    }))

    winston.info('DONE')
    sqlPoolService.drain()
  } catch (error) {
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}

main()
