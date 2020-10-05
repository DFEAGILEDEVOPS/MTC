'use strict'

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolImportService } from './school-import.service'
const name = 'school-import'

const blobTrigger: AzureFunction = async function schoolImportIndex (context: Context, blob: any) {
  const start = performance.now()
  context.log(`${name} started for blob \n Name: ${context.bindingData.name} \n Blob Size: ${blob.length} Bytes`)

  let meta
  try {
    const svc = new SchoolImportService()
    meta = await svc.process(context, blob)
  } catch (error) {
    meta = { processCount: 'n/a' }
    context.log.error(`${name}: ERROR: ${error.message}`, error)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${name}: ${timeStamp} processed ${meta.processCount} schools, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger
