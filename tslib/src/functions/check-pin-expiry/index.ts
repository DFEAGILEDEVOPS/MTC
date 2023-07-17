import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { SqlService } from '../../sql/sql.service'
import { CheckPinExpiryService } from './check-pin-expiry.service'
const functionName = 'check-pin-expiry'

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()
  const checkPinExpiryService = new CheckPinExpiryService(new SqlService())
  await checkPinExpiryService.process()
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
