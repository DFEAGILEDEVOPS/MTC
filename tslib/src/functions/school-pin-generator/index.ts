import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SchoolPinReplenishmnentService } from './school-pin-replenishment.service'
const functionName = 'school-pin-generator'

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
  context.done()
}

const schoolPinGenerator: AzureFunction = async function (context: Context, timer: any): Promise<void> {

  if (timer.IsPastDue) {
    context.log('timer is past due, exiting...')
    return
  }

  const start = performance.now()
  const replenishmentService = new SchoolPinReplenishmnentService()
  await replenishmentService.process(context.log)
  finish(start, context)
}

export default schoolPinGenerator
