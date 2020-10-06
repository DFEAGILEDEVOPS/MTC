'use strict'

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolImportService } from './school-import.service'
import * as mssql from 'mssql'
import config from '../../config'
import { ConnectionPoolService } from '../../sql/sql.service'
import { SchoolImportJobResult } from './ISchoolImportJobResult'

const name = 'school-import'

const blobTrigger: AzureFunction = async function schoolImportIndex (context: Context, blob: any) {

  const start = performance.now()
  context.log(`${name} started for blob \n Name: ${context.bindingData.name} \n Blob Size: ${blob.length} Bytes`)
  let pool: mssql.ConnectionPool
  let jobResult = new SchoolImportJobResult()

  try {
    const sqlConfig: mssql.config = {
      database: config.Sql.database,
      server: config.Sql.server,
      port: config.Sql.port,
      requestTimeout: config.Sql.requestTimeout,
      connectionTimeout: config.Sql.connectionTimeout,
      user: config.Sql.user,
      password: config.Sql.password,
      pool: {
        min: config.Sql.Pooling.MinCount,
        max: config.Sql.Pooling.MaxCount
      },
      options: {
        appName: config.Sql.options.appName,
        encrypt: config.Sql.options.encrypt
      }
    }
    pool = await ConnectionPoolService.getInstanceWithConfig(sqlConfig, context.log)
    const svc = new SchoolImportService(pool, jobResult)
    jobResult = await svc.process(context, blob)
    await pool.close()
  } catch (error) {
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${jobResult.linesProcessed} schools, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger
