
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as moment from 'moment'
import { SchoolPinSampler } from './school-pin-sampler'

const schoolPinSampler: AzureFunction = function (context: Context, req: HttpRequest): void {

  const utcNow = req.body.utcnow || moment.utc()
  const sampleSize = req.body.samplesize || 20
  const randomise = req.body.randomise || false
  context.log.info(`creating sample of ${sampleSize} school pins generated at ${utcNow}`)
  const sampler = new SchoolPinSampler()
  const sample = sampler.generateSample(sampleSize, utcNow, randomise)
  context.res = sample
  context.done()
}

export default schoolPinSampler
