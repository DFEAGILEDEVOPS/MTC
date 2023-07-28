import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import moment from 'moment'
import { SchoolPinSampler } from './school-pin-sampler'
import { performance } from 'perf_hooks'
import config from '../../config'

const functionName = 'util-school-pin-sampler'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
  // required as non-async
  context.done()
}

const schoolPinSampler: AzureFunction = function (context: Context, req: HttpRequest): void {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    context.done()
    return
  }
  const start = performance.now()
  if (req.body === undefined) req.body = {}
  const utcNow = req.body?.utcnow !== undefined ? moment(req.body.utcnow) : moment.utc()
  const sampleSize = req.body.samplesize ?? 20
  const randomise = req.body.randomise ?? false
  context.log.info(`creating sample of ${sampleSize} school pins generated at ${utcNow.toISOString()}`)
  const sampler = new SchoolPinSampler()
  const sample = sampler.generateSample(sampleSize, utcNow, randomise)
  context.res = {
    body: sample,
    headers: {
      'Content-Type': 'application/json'
    }
  }
  finish(start, context)
}

export default schoolPinSampler
