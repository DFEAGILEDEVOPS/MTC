'use strict'

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CensusImportV1 } from './v1'
import * as mssql from 'mssql'
import config from '../../config'

const blobTrigger: AzureFunction = async function (context: Context, blob: any): Promise<void> {
  const start = performance.now()
  let pool: mssql.ConnectionPool | undefined
  let meta
  try {
    const sqlConfig: mssql.config = {
      database: config.Sql.database,
      server: config.Sql.server,
      port: config.Sql.port,
      requestTimeout: config.Sql.censusRequestTimeout,
      connectionTimeout: config.Sql.connectionTimeout,
      user: config.Sql.PupilCensus.Username,
      password: config.Sql.PupilCensus.Password,
      pool: {
        min: config.Sql.Pooling.MinCount,
        max: config.Sql.Pooling.MaxCount
      },
      options: {
        appName: config.Sql.options.appName, // docker default
        encrypt: config.Sql.options.encrypt
      }
    }
    pool = new mssql.ConnectionPool(sqlConfig, context.log)
    await pool.connect()
    const v1 = new CensusImportV1(pool, context.log)
    meta = await v1.process(blob, context.bindingData.uri)
    await pool.close()
  } catch (error) {
    if (pool?.connected === true) {
      await pool.close()
    }
    context.log.error(`census-import: ERROR: ${error.message}`)
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`census-import: ${timeStamp} processed ${meta.processCount} pupil records, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger
