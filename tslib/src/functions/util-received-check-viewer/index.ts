import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import * as azh from '../../azure/storage-helper'
import * as lz from 'lz-string'

const functionName = 'util-received-check-reader'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const schoolPinSampler: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    context.done()
    return
  }
  const start = performance.now()
  if (req.query.checkCode === undefined || req.query.schoolUUID === undefined) {
    context.res = {
      statusCode: 400,
      body: 'checkCode and schoolUUID properties are required'
    }
  }
  const tableService = new azh.AsyncTableService()
  const receivedCheck = await tableService.retrieveEntityAsync('receivedCheck', req.query.schoolUUID, req.query.checkCode)
  const archive = receivedCheck.archive
  const decompressed = lz.decompressFromUTF16(archive)
  context.res = {
    body: JSON.stringify(decompressed, null, 2),
    headers: {
      'Content-Type': 'application/json'
    }
  }
  finish(start, context)
}

export default schoolPinSampler
