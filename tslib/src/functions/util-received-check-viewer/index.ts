import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import * as azh from '../../azure/storage-helper'
import { CompressionService } from '../../common/compression-service'

const functionName = 'util-received-check-reader'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const checkRetriever: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
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
  const schoolUUID = req.query.schoolUUID ?? ''
  const checkCode = req.query.checkCode ?? ''
  const receivedCheck = await tableService.retrieveEntityAsync('receivedCheck', schoolUUID, checkCode)
  const archive = receivedCheck.archive._
  const compressionService = new CompressionService()
  const decompressed = compressionService.decompress(archive)
  context.res = {
    body: decompressed,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  finish(start, context)
}

export default checkRetriever
