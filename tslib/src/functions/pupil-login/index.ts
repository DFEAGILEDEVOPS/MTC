import { app, output, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import { PupilLoginService, type IPupilLoginMessage } from './pupil-login.service'

const functionName = 'pupil-login'
const pupilLoginService = new PupilLoginService()

const outputTable = output.table({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  tableName: 'pupilEvent'
})

app.serviceBusQueue(functionName, {
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'pupil-login',
  handler: pupilLogin,
  extraOutputs: [outputTable]
})

export async function pupilLogin (triggerInput: unknown, context: InvocationContext): Promise<void> {
  const start = performance.now()
  const pupilLoginMessage = triggerInput as IPupilLoginMessage
  const version = pupilLoginMessage.version
  context.info(`${functionName}: version:${version} message received for checkCode ${pupilLoginMessage.checkCode}`)

  const outputs = await pupilLoginService.process(pupilLoginMessage)
  context.extraOutputs.set(outputTable, outputs.pupilEventTable)

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}
