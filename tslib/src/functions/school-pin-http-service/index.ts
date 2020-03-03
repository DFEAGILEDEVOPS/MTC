
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

  if (!req.body || !req.body.school_id) {
    context.res = {
      status: 400,
      body: 'school_id is required'
    }
    return
  }

  const schoolId = req.body.school_id

  const start = performance.now()
  const schoolPinReplenishmentService = new SchoolPinReplenishmnentService()
  context.log(`requesting pin for school:${schoolId}`)
  const newPin = await schoolPinReplenishmentService.process(context.log, schoolId)
  context.log(`pin:${newPin} generated for school:${schoolId}`)
  context.res = {
    status: 200,
    body: {
      pin: newPin
    }
  }
  finish(start, context)
}

export default schoolPinHttpService
