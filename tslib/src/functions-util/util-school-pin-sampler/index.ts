import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import moment from 'moment'
import { SchoolPinSampler } from './school-pin-sampler'
import { performance } from 'perf_hooks'
import config from '../../config'

const functionName = 'util-school-pin-sampler'

app.http(functionName, {
  methods: ['POST'],
  authLevel: 'function',
  handler: schoolPinSampler
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function schoolPinSampler (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }
  const start = performance.now()
  const rawJsonBody = await req.json()
  const reqBody = JSON.parse(rawJsonBody as string)
  const utcNow = reqBody.utcnow !== undefined ? moment(reqBody.utcnow) : moment.utc()
  const sampleSize = reqBody.samplesize ?? 20
  const randomise = reqBody.randomise ?? false
  context.info(`creating sample of ${sampleSize} school pins generated at ${utcNow.toISOString()}`)
  const sampler = new SchoolPinSampler()
  const sample = sampler.generateSample(sampleSize, utcNow, randomise)
  finish(start, context)
  return {
    jsonBody: sample,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}

export default schoolPinSampler
