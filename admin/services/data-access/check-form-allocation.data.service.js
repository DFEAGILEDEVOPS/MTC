'use strict'

const { TYPES } = require('./sql.service')
const sqlService = require('./sql.service')
const config = require('../../config')
const table = '[checkFormAllocation]'

const checkFormAllocationDataService = {}

checkFormAllocationDataService.sqlFindByIdsHydrated = function (ids) {
  const select = `SELECT
      chk.id as check_id,
      chk.checkCode as check_checkCode,
      chk.isLiveCheck as check_isLiveCheck,
      pin.val as pupil_pin,
      cp.pinExpiresAt as pupil_pinExpiresAt,
      pupil.id as pupil_id,
      pupil.foreName as pupil_foreName,
      pupil.lastName as pupil_lastName,
      pupil.foreNameAlias as pupil_foreNameAlias,
      pupil.lastNameAlias as pupil_lastNameAlias,
      pupil.dateOfBirth as pupil_dateOfBirth,
      pupil.jwtToken as pupil_jwtToken,
      checkForm.id as checkForm_id,
      checkForm.formData as checkForm_formData,
      school.id as school_id,
      school.urlSlug as school_uuid,
      school.name as school_name,
      school.pin as school_pin,
      ISNULL(sce.timezone, '${config.DEFAULT_TIMEZONE}') as timezone
    FROM
      ${sqlService.adminSchema}.[check] chk
      JOIN ${sqlService.adminSchema}.[pupil] pupil ON (chk.pupil_id = pupil.id)
      JOIN ${sqlService.adminSchema}.[checkForm] checkForm ON (chk.checkForm_id = checkForm.id)
      JOIN ${sqlService.adminSchema}.[school] school on (pupil.school_id = school.id)
      JOIN ${sqlService.adminSchema}.[checkPin] cp on (chk.id = cp.check_id)
      JOIN ${sqlService.adminSchema}.[pin] pin ON (cp.pin_id = pin.id)
      LEFT JOIN ${sqlService.adminSchema}.sce ON (sce.school_id = school.id)
    `
  const { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = `WHERE chk.id IN (${paramIdentifiers.join(', ')})`
  const sql = [select, whereClause].join(' ')
  return sqlService.readonlyQuery(sql, params)
}

checkFormAllocationDataService.sqlCreateBatch = async function (checkFormAllocations) {
  const insert = `DECLARE @output TABLE (id int);
  INSERT INTO ${sqlService.adminSchema}.${table} (
    pupil_id,
    checkForm_id,
    checkWindow_id,
    isLiveCheck
  )  OUTPUT inserted.ID INTO @output
  VALUES `
  const output = '; SELECT * from @output'

  const params = []
  const insertClauses = []

  checkFormAllocations.forEach((c, i) => {
    params.push({ name: `pupil_id${i}`, value: c.pupil_id, type: TYPES.Int })
    params.push({ name: `checkForm_id${i}`, value: c.checkForm_id, type: TYPES.Int })
    params.push({ name: `checkWindow_id${i}`, value: c.checkWindow_id, type: TYPES.Int })
    params.push({ name: `isLiveCheck${i}`, value: c.isLiveCheck, type: TYPES.Bit })
    insertClauses.push(`(@pupil_id${i}, @checkForm_id${i}, @checkWindow_id${i}, @isLiveCheck${i})`)
  })

  const sql = [insert, insertClauses.join(', '), output].join(' ')
  return sqlService.modify(sql, params)
}

module.exports = checkFormAllocationDataService
