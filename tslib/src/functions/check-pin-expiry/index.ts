import { app, type Timer, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SqlService } from '../../sql/sql.service'
import { CheckPinExpiryService } from './check-pin-expiry.service'
const functionName = 'check-pin-expiry'

app.timer('checkPinExpiryTrigger', {
  schedule: '0 10 18,4 * * *', // sec, min, hour, day, month, dow
  handler: checkPinExpiryTrigger
})

export async function checkPinExpiryTrigger (timer: Timer, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const checkPinExpiryService = new CheckPinExpiryService(new SqlService())
  await checkPinExpiryService.process()
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
