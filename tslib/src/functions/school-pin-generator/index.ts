import { app, type Timer, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolPinReplenishmnentService } from './school-pin-replenishment.service'

const functionName = 'school-pin-generator'

app.timer(functionName, {
  schedule: '0 0 * * * *', // every hour, on the hour
  handler: schoolPinGenerator
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function schoolPinGenerator (timer: Timer, context: InvocationContext): Promise<void> {
  const start = performance.now()
  context.log(`${functionName} starting`)
  const replenishmentService = new SchoolPinReplenishmnentService()
  await replenishmentService.process(context)
  finish(start, context)
}
