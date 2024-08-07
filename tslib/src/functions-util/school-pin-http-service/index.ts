import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { SchoolPinReplenishmnentService } from '../../functions/school-pin-generator/school-pin-replenishment.service'
import { performance } from 'perf_hooks'
import config from '../../config'
const functionName = 'util-school-pin-generator'

app.http(functionName, {
  methods: ['POST'],
  authLevel: 'function',
  handler: schoolPinGenerator
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function schoolPinGenerator (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName}:exiting as not enabled (default behaviour)`)
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }

  const rawJson = await req.json()
  const reqBody = rawJson as Record<string, number>
  const schoolIdParam = reqBody.school_id

  if (schoolIdParam === undefined) {
    return {
      status: 400,
      body: 'school_id is required'
    }
  }

  const start = performance.now()
  const schoolPinReplenishmentService = new SchoolPinReplenishmnentService()
  context.log(`${functionName}: requesting pin for school:${schoolIdParam}`)
  const newPin = await schoolPinReplenishmentService.process(context, schoolIdParam)
  context.log(`${functionName}: pin:${newPin} generated for school:${schoolIdParam}`)
  finish(start, context)
  return {
    status: 200,
    jsonBody: {
      pin: newPin
    }
  }
}
