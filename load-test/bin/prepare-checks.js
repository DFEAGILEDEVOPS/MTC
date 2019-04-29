#!/usr/bin/env node
'use strict'
require('dotenv').config()
const { PerformanceObserver, performance } = require('perf_hooks');
const checkStartService = require('../../admin/services/check-start.service')
const sqlService = require('../../admin/services/data-access/sql.service')

async function findSchoolIds () {
  const sql = `select id from [mtc_admin].[school]`
  const res = await sqlService.query(sql)
  return res.map(obj => obj.id)
}

async function sqlFindPupilsAndSchoolData (numPupils, schoolId) {
  const sql = `
    select TOP (${numPupils})
      s.id as schoolId,
      s.dfeNumber,
      p.id as pupilId
  FROM
      [mtc_admin].[pupil] p JOIN
      [mtc_admin].[school] s ON (p.school_id = s.id) LEFT JOIN
      [mtc_admin].[check] chk ON (p.id = chk.pupil_id)
   WHERE
      chk.id IS NULL
    AND s.id = @schoolId
  `
  const params = [
    { name: 'schoolId', value: schoolId, type: sqlService.TYPES.Int }
  ]
  return sqlService.query(sql, params)
}

async function processSchool (schoolId, numPupils) {
  const pupilData = await sqlFindPupilsAndSchoolData(numPupils, schoolId)
  // Using prepareCheck2
  const pupilIds = pupilData.map(p => p.pupilId)
  const dfeNumber = pupilData[0].dfeNumber

  try {
    await checkStartService.prepareCheck2(
      pupilIds,
      dfeNumber,
      schoolId,
      true)
  } catch (error) {
    console.error('Error caught:', error)
  }
}

async function main () {
  try {
    await sqlService.initPool()
    const numPupils = parseInt(process.argv[2])
    if (!numPupils) {
      throw new Error('Pupil length argument is not supplied or is not a valid number')
    }
    const schoolIds = await findSchoolIds()
    console.log('got School Ids ', schoolIds.length)

    let cnt = 0
    for (const id of schoolIds) {
      await processSchool(id, numPupils)
      if (++cnt % 100 === 0) {
        console.log(`${cnt} schools`)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

main()
  .then(() => {
    sqlService.drainPool()
  })
  .catch(e => {
    console.warn(e)
    sqlService.drainPool()
  })
