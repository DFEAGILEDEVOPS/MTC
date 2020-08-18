import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'gias-sync'
import { SqlService } from '../../sql/sql.service'
import { CheckPinExpiryService as GiasSyncService } from './gias-sync.service'

const timerTrigger: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()
  const giasSyncService = new GiasSyncService(new SqlService())
  await giasSyncService.process()
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
