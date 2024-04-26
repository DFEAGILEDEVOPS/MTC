import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import { SchoolPinReplenishmnentService } from '../school-pin-generator/school-pin-replenishment.service'
import { performance } from 'perf_hooks'
import config from '../../config'
const functionName = 'school-pin-http-service'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const schoolPinHttpService: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName}:exiting as not enabled (default behaviour)`)
    return
  }

  const schoolIdParam = req?.body?.school_id

  if (schoolIdParam === undefined) {
    context.res = {
      status: 400,
      body: 'school_id is required'
    }
    return
  }

  const start = performance.now()
  const schoolPinReplenishmentService = new SchoolPinReplenishmnentService()
  context.log(`${functionName}: requesting pin for school:${schoolIdParam}`)
  const newPin = await schoolPinReplenishmentService.process(context.log, schoolIdParam)
  context.log(`${functionName}: pin:${newPin} generated for school:${schoolIdParam}`)
  context.res = {
    status: 200,
    body: {
      pin: newPin
    }
  }
  finish(start, context)
}

export default schoolPinHttpService
