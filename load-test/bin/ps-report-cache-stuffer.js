#!/usr/bin/env node
'use strict'

const sqlService = require('../../admin/services/data-access/sql.service')
const moment = require('moment')
const psReportMock = require('./ps-report-mock')
const payload = JSON.stringify(psReportMock)

async function insertPsReports (batchSize) {
  const sql = `SELECT TOP (${batchSize}) 
     chk.id as checkId, chk.checkCode 
     FROM [mtc_admin].[check] as chk LEFT JOIN [mtc_admin].[psychometricianReportCache] prc ON (prc.check_id = chk.id)
     WHERE checkStatus_id = 3
     AND prc.id is NULL
     `

  const res = await sqlService.query(sql)

  const inserts = []
  const params = []

  res.forEach((row, i)  => {
    inserts.push(`INSERT INTO [mtc_admin].[psychometricianReportCache] (check_id, jsonData) values (@checkId${i}, @payload${i});`)
    params.push({ name: `checkId${i}`, value: row.checkId, type: sqlService.TYPES.Int })
    params.push({ name: `payload${i}`, value: payload, type: sqlService.TYPES.NVarChar })
  })

  try {
    await sqlService.modifyWithTransaction(inserts.join('\n'), params)
  } catch (error) {
    console.log('Error caught, carrying on regardless: ' + error.message)
  }

  if (!res) {
    return false
  }

  return res.length > 0
}

async function updateAllNewChecksToComplete() {
  const date = moment()
  const sql = `UPDATE [mtc_admin].[check] 
    SET checkStatus_id = (SELECT TOP (1) id from [mtc_admin].[checkStatus] where code = 'CMP'),
        pupilLoginDate = @date
    WHERE checkStatus_id = 1`
  const params = [
    { name: 'date', value: date, type: sqlService.TYPES.DateTimeOffset }
  ]
  return sqlService.modify(sql, params)
}

async function main () {
  await sqlService.initPool()
  // there may be 750K checks to complete
  // 1. update status to logged in
  console.log('Updating checks to COMPLETE')
  await updateAllNewChecksToComplete()
  console.log('done')

  let count = 0
  while(true) {
    const processedFlag = await insertPsReports(50)
    if (processedFlag === false) {
      break;
    }
    if (++count % 1000 === 0) {
      console.log(`${count} processed`)
    }
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