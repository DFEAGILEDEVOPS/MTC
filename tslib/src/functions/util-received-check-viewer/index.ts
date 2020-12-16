
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import moment from 'moment'
import { performance } from 'perf_hooks'
import config from '../../config'
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
  if (req.body?.checkCode === undefined || req.body?.schoolUUID === undefined) {
    context.res = {
      statusCode: 400,
      body: 'checkCode and schoolUUID properties are required'
    }
  }
  const utcNow = req.body?.utcnow !== undefined ? moment(req.body.utcnow) : moment.utc()
  context.res = {
    body: '',
    headers: {
      'Content-Type': 'application/json'
    }
  }
  finish(start, context)
}

export default schoolPinSampler
