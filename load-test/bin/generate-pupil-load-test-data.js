const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')

async function main () {
  try {
    const pinExpireyDays = 1
    const pinExpireyDate = new Date()
    pinExpireyDate.setDate(pinExpireyDate.getDate() + pinExpireyDays)

    const numPupils = parseInt(process.argv[2])
    if (!numPupils) {
      throw new Error('Pupil length argument is not supplied or is not a valid number')
    }

    let schools, numSchools, pupilsPerSchool, pupilsRemainder, params

    schools = await sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[school]`)
    numSchools = schools.length

    // When generating less pupils than the total number of schools, slice
    // the schools array to the number of pupils and set 1 pupil per school
    pupilsPerSchool = Math.floor(numPupils / numSchools)
    if (pupilsPerSchool < 1) {
      pupilsPerSchool = 1
      schools = schools.slice(0, numPupils)
      numSchools = schools.length
      pupilsRemainder = 0
    } else {
      pupilsRemainder = numPupils - (pupilsPerSchool * numSchools)
    }

    winston.info(`Generating ${numPupils} pupils across ${numSchools} schools`)

    for (let i = 0; i < numSchools; i++) {
      let school = schools[i]
      let totalPupils = pupilsPerSchool
      if (i < pupilsRemainder) {
        totalPupils += 1
      }
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
        },
        {
          name: 'pinExpiresAt',
          value: pinExpireyDate,
          type: TYPES.DateTimeOffset
        }
      ]

      // TODO set school pin?
      // TODO set check pin?
      // TODO is anything else required to emulate prepareCheck()?
      const sql = `
      DECLARE @cnt INT = 1;
      DECLARE @baseUpn INT = 80120000 + @schoolId
      BEGIN TRAN
      WHILE @cnt <= ${totalPupils}
      BEGIN
      BEGIN TRY

      UPDATE ${sqlService.adminSchema}.[school] 
      SET pin = '${randomPass()}', pinExpiresAt = @pinExpiresAt
      WHERE id = ${school.id} AND pin IS NULL

      INSERT ${sqlService.adminSchema}.[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn, isTestAccount, pin, pinExpiresAt) 
      VALUES (@schoolId, CAST(@cnt AS NVARCHAR), 'Pupil', 'M', @dateOfBirth, CAST(@baseUpn AS NVARCHAR) + CAST(@cnt AS NVARCHAR) + '1A', 1,RIGHT('0000'+CAST(@cnt as NVARCHAR), 4), @pinExpiresAt)
      INSERT ${sqlService.adminSchema}.[check] (pupil_id, checkwindow_id, checkform_id, checkstatus_id, islivecheck)
      VALUES (scope_identity(), 1, 1, 1, 0)

      END TRY
      BEGIN CATCH
      END CATCH
      SET @cnt = @cnt + 1;
      END;
      COMMIT TRAN`
      await sqlService.query(sql, params)
    }

    winston.info('DONE')
    sqlPoolService.drain()
  } catch (error) {
    console.log('error')
    winston.info(error)
    process.exitCode = 1
    sqlPoolService.drain()
  }
}

function randomPass () {
  let chars = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 3)
  let numbers = Math.random().toString().substr(2, 5)
  return chars + numbers
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}

main()
