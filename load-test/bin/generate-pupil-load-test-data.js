const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const sqlService = require('../../admin/services/data-access/sql.service')

async function main () {
  try {
    const pinExpiryDays = 1
    const pinExpiryDate = moment().add(pinExpiryDays, 'day').toDate()

    const numPupils = parseInt(process.argv[2])
    if (!numPupils) {
      throw new Error('Pupil length argument is not supplied or is not a valid number')
    }

    let schools, numSchools, pupilsPerSchool, pupilsRemainder, params
    let existingPupils = 0

    schools = await sqlService.query(`SELECT id FROM ${sqlService.adminSchema}.[school]`)
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
          name: 'pinExpiresAtUtc',
          value: pinExpiryDate,
          type: TYPES.DateTimeOffset
        }
      ]

      const sql = `
      DECLARE @cnt INT = 1;
      DECLARE @baseUpn INT = 80120000 + @schoolId;
      DECLARE @tvp AS ${sqlService.adminSchema}.CheckTableType;
      DECLARE @existingPupils INT = 0;
      BEGIN TRAN

        UPDATE ${sqlService.adminSchema}.[school]
        SET pin = '${randomPass()}', pinExpiresAt = @pinExpiresAt
        WHERE id = ${school.id} AND pin IS NULL;

        WHILE @cnt <= ${totalPupils}
        BEGIN
          BEGIN TRY

            INSERT INTO ${sqlService.adminSchema}.[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn, isTestAccount)
            VALUES (@schoolId, 'Pupil', CAST(@cnt AS NVARCHAR), 'M', @dateOfBirth, CAST(@baseUpn AS NVARCHAR) + CAST(@cnt AS NVARCHAR) + '1A', 1);

            INSERT INTO @tvp (pupil_id, checkForm_id, checkWindow_id, isLiveCheck, pinExpiresAtUtc, pinValidFromUtc school_id)
            VALUES (scope_identity(), 1, 1, 1, @pinExpiresAtUtc, @pinValidFromUtc, @schoolId);

          END TRY
          BEGIN CATCH
            -- The try/catch statement catches duplicate inserts for already generated pupils
            -- If the generated pupil already exists in the db then we can assume that the
            -- spCreateChecks procedure has already been called for that pupil
            -- Keep a count of existingPupils for feedback later on
            SET @existingPupils = @existingPupils + 1;
          END CATCH
          SET @cnt = @cnt + 1;
        END
      COMMIT TRAN

      EXEC [mtc_admin].[spCreateChecks] @tvp;

      SELECT @existingPupils as existingPupils;
      `
      let result = await sqlService.query(sql, params)
      existingPupils += result[0]['existingPupils'] || 0
    }
    winston.info('Finished')
    if (existingPupils) {
      winston.info(`${existingPupils} pupils already generated, added ${numPupils - existingPupils} new pupils`)
    } else {
      winston.info(`Generated ${numPupils} new pupils`)
    }
    sqlService.drainPool()
  } catch (error) {
    console.log('error')
    winston.info(error)
    process.exitCode = 1
    sqlService.drainPool()
  }
}

function randomPass () {
  const chars = Math.random().toString(36).replace(/[^a-z]+/g, '')
  const chars2 = Math.random().toString(36).replace(/[^a-z]+/g, '')
  const numbers = Math.random().toString().substr(2, 2)
  return chars.substr(0, 3) + numbers + chars2.substr(0, 3)
}

function randomDob () {
  const rnd = Math.floor(Math.random() * (365 * 2) + 1)
  const dob = moment().utc().subtract(9, 'years').subtract(rnd, 'days')
  dob.hours(0).minute(0).second(0)
  return dob.toDate()
}

main()
