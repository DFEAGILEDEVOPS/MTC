'use strict'

const TYPES = require('tedious').TYPES
const sqlService = require('./sql.service')
const table = '[checkFormAllocation]'

const checkFormAllocationDataService = {}

checkFormAllocationDataService.sqlFindByIdsHydrated = function (ids) {
  const select = `SELECT 
      cfa.id as checkFormAllocation_id,
      cfa.checkCode as checkFormAllocation_checkCode,
      pupil.id as pupil_id,
      pupil.foreName as pupil_foreName,
      pupil.lastName as pupil_lastName,
      pupil.dateOfBirth as pupil_dateOfBirth,
      pupil.jwtToken as pupil_jwtToken,
      pupil.pin as pupil_pin,
      checkForm.id as checkForm_id,
      checkForm.formData as checkForm_formData,
      school.id as school_id,
      school.name as school_name,
      school.pin as school_pin
    FROM 
      ${sqlService.adminSchema}.${table} cfa 
      JOIN ${sqlService.adminSchema}.[pupil] pupil ON (cfa.pupil_id = pupil.id)
      JOIN ${sqlService.adminSchema}.[checkForm] checkForm ON (cfa.checkForm_id = checkForm.id)
      JOIN ${sqlService.adminSchema}.[school] school on (pupil.school_id = school.id)
    `
  let { params, paramIdentifiers } = sqlService.buildParameterList(ids, TYPES.Int)
  const whereClause = `WHERE cfa.id IN (${paramIdentifiers.join(', ')})`
  const sql = [ select, whereClause ].join(' ')
  return sqlService.query(sql, params)
}

checkFormAllocationDataService.sqlCreateBatch = async function (checkFormAllocations) {
  const insert = ` DECLARE @output TABLE (id int);
  INSERT INTO ${sqlService.adminSchema}.${table} (
    pupil_id,
    checkForm_id,
    checkWindow_id,
    isLiveCheck
  )  OUTPUT inserted.ID INTO @output
  VALUES `
  const output = `; SELECT * from @output`

  const params = []
  const insertClauses = []

  checkFormAllocations.forEach((c, i) => {
    params.push({name: `pupil_id${i}`, value: c.pupil_id, type: TYPES.Int})
    params.push({name: `checkForm_id${i}`, value: c.checkForm_id, type: TYPES.Int})
    params.push({name: `checkWindow_id${i}`, value: c.checkWindow_id, type: TYPES.Int})
    params.push({name: `isLiveCheck${i}`, value: c.isLiveCheck, type: TYPES.Bit})
    insertClauses.push(`(@pupil_id${i}, @checkForm_id${i}, @checkWindow_id${i}, @isLiveCheck${i})`)
  })

  const sql = [insert, insertClauses.join(', '), output].join(' ')
  return sqlService.modify(sql, params)
}

module.exports = checkFormAllocationDataService
