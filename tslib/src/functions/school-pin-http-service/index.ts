
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { SchoolPinReplenishmnentService } from '../school-pin-generator/school-pin-replenishment.service'
const functionName = 'school-pin-http-service'
import { performance } from 'perf_hooks'

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const schoolPinHttpService: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  if (!req.body || !req.body.school_uuid) {
    context.res = {
      status: 400,
      body: 'school_uuid is required'
    }
    return
  }

  const schoolUuid = req.body.school_uuid

  const start = performance.now()
  const schoolPinReplenishmentService = new SchoolPinReplenishmnentService()
  const newPin = await schoolPinReplenishmentService.process(context.log, schoolUuid)
  context.res = {
    status: 200,
    body: {
      pin: newPin
    }
  }
  finish(start, context)
}

export default schoolPinHttpService
