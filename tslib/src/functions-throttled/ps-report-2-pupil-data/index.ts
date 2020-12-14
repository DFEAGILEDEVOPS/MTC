import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'

const functionName = 'ps-report-2-pupil-data'

const serviceBusQueueTrigger: AzureFunction = async function (context: Context, incomingMessage: any): Promise<void> {
  const start = performance.now()
  const meta = { processCount: 0, errorCount: 0 }
  context.log.verbose(`${functionName}: called for school ${incomingMessage.name}`)
  context.bindings.psReportPupilMessage = []
  for (let i = 0; i < 10; i++) {
    context.log.verbose(`${functionName}: adding pupil ${i} for school ${incomingMessage.name}`)
    context.bindings.psReportPupilMessage.push({
      pupil: i,
      schoolName: incomingMessage.name,
      schoolUuid: incomingMessage.uuid
    })
  }
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log.info(`${functionName}: ${timeStamp} processed ${meta.processCount} records, run took ${durationInMilliseconds} ms`)
}

export default serviceBusQueueTrigger
