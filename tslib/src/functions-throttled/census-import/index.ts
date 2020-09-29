'use strict'

import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { CensusImportV1 } from './v1'

const blobTrigger: AzureFunction = async function (context: Context, blob: any): Promise<void> {
  const start = performance.now()
  let meta
  try {
    const v1 = new CensusImportV1()
    meta = await v1.process(context, blob)
  } catch (error) {
    context.log.error(`census-import: ERROR: ${error.message}`)
    throw error
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`census-import: ${timeStamp} processed ${meta.processCount} pupil records, run took ${durationInMilliseconds} ms`)
}

export default blobTrigger
