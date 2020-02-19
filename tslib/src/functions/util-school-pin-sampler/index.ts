
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as moment from 'moment'

const schoolPinSampler: AzureFunction = function (context: Context, req: HttpRequest): void {

  const utcNow = req.query['utcnow'] || moment.utc()
  const sampleSize = req.query['samplesize'] || 20
  context.log.info(`creating sample of ${sampleSize} school pins generated at ${utcNow}`)
  context.done()
}

export default schoolPinSampler
