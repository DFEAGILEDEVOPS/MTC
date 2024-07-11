'use strict'

import { app, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CensusImportV1 } from './v1'
import * as mssql from 'mssql'
import config from '../../config'

app.storageBlob('census-import', {
  handler: censusImportFunction,
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  path: 'census'
})

export async function censusImportFunction (blobTriggerInput: unknown, context: InvocationContext): Promise<void> {
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
      user: config.Sql.user,
      password: config.Sql.password,
      pool: {
        min: config.Sql.Pooling.MinCount,
        max: config.Sql.Pooling.MaxCount
      },
      options: config.Sql.options
    }
    pool = new mssql.ConnectionPool(sqlConfig)
    await pool.connect()
    const v1 = new CensusImportV1(pool, context)
    // TODO how to get this?
    const blobUri = context.triggerMetadata?.uri ?? ''
    meta = await v1.process(blobTriggerInput, blobUri.toString())
    await pool.close()
  } catch (error) {
    if (pool?.connected === true) {
      await pool.close()
    }
    if (error instanceof Error) {
      context.error(`census-import: ERROR: ${error.message}`)
    }
    throw error
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`census-import: ${timeStamp} processed ${meta.processCount} pupil records, run took ${durationInMilliseconds} ms`)
}
