const winston = require('winston')
const { TYPES } = require('tedious')
const moment = require('moment')
const converter = require('number-to-words')
const R = require('ramda')
const sqlService = require('../../admin/services/data-access/sql.service')
const sqlPoolService = require('../../admin/services/data-access/sql.pool.service')
const schoolDataService = require('../../admin/services/data-access/school.data.service')
const pupilDataService = require('../../admin/services/data-access/pupil.data.service')
const pinGenerationService = require('../../admin/services/pin-generation.service')
const checkStartService = require('../../admin/services/check-start.service')

async function main () {
  try {
    const schoolLength = parseInt(process.argv[2])
    if (!schoolLength) {
      throw new Error('School length argument is not supplied or is not a valid number')
    }
    // Generate additional example schools based on schoolLength
    winston.info('Generating schools...')
    const dfeNumbers = []
    for (let i = 0; i < schoolLength; i++) {
      let estabCode = 1006 + i
      const schoolNumber = converter.toWords(6 + i)
      const exampleSchoolNumber = schoolNumber.charAt(0).toUpperCase() + schoolNumber.slice(1)
      estabCode = estabCode.toString()
      let name = `Example School ${exampleSchoolNumber}`
      const dfeNumber = 9991006 + i
      dfeNumbers.push(dfeNumber)
      const urn = 89006 + i
      const params = [
        {
          name: 'estabCode',
          value: estabCode,
          type: TYPES.NVarChar
        },
        {
          name: 'name',
          value: name,
          type: TYPES.NVarChar
        },
        {
          name: 'urn',
          value: urn,
          type: TYPES.Int
        },
        {
          name: 'dfeNumber',
          value: dfeNumber,
          type: TYPES.Int
        }
      ]
      const sql = `INSERT INTO ${sqlService.adminSchema}.school
      (leaCode, estabCode, name, urn, dfeNumber)
      VALUES (999, @estabCode, @name, @urn, @dfeNumber)`
      await sqlService.query(sql, params)
    }
    const testSchools = await schoolDataService.sqlFindByDfeNumbers(dfeNumbers)
    // Generate additional pupils for these schools and pins
    winston.info('Generating pupils within schools and pins...')
    await Promise.all(testSchools.map(async s => {
      const params = [
        {
          name: 'schoolId',
          value: s.id,
          type: TYPES.NVarChar
        },
        {
          name: 'dateOfBirth',
          value: randomDob(),
          type: TYPES.DateTimeOffset
        }
      ]
      const sql = `
      DECLARE @cnt INT = 0;
      DECLARE @baseUpn INT = 80120000 + @schoolId
      WHILE @cnt < 60
      BEGIN
        INSERT ${sqlService.adminSchema}.[pupil] (school_id, foreName, lastName, gender, dateOfBirth, upn) 
        VALUES (@schoolId, CAST(@cnt AS NVARCHAR), 'Pupil', 'M', @dateOfBirth, CAST(@baseUpn AS NVARCHAR) + CAST(@cnt AS NVARCHAR) + '1A')
        SET @cnt = @cnt + 1;
      END;`
      await sqlService.query(sql, params)
      const update = pinGenerationService.generateSchoolPassword(s)
      await schoolDataService.sqlUpdate(R.assoc('id', s.id, update))
      const pupils = await pupilDataService.sqlFindPupilsByDfeNumber(s.dfeNumber)
      const pupilsList = pupils.map(p => p.id)
      await checkStartService.prepareCheck(pupilsList, s.dfeNumber, s.id)
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
