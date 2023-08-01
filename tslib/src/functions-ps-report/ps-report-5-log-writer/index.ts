import { type AzureFunction, type Context } from '@azure/functions'
import { performance } from 'perf_hooks'
import { type IFunctionTimer } from '../../azure/functions'
import config from '../../config'
import * as sb from '@azure/service-bus'
import * as RA from 'ramda-adjunct'
import { LogService } from './log.service'
import moment from 'moment'

const functionName = 'ps-report-log-generator'
const queueName = 'ps-report-log'

const funcImplementation: AzureFunction = async function (context: Context, timer: IFunctionTimer): Promise<void> {
  if (timer.isPastDue) {
    context.log(`${functionName}: timer is past due, exiting.`)
    return
  }
  const start = performance.now()

  if (config.ServiceBus.ConnectionString === undefined) {
    throw new Error(`${functionName}: ServiceBusConnection env var is missing`)
  }

  let busClient: sb.ServiceBusClient
  let receiver: sb.ServiceBusReceiver

  const disconnect = async (): Promise<void> => {
    await receiver.close()
    await busClient.close()
  }

  try {
    context.log(`${functionName}: connecting to service bus...`)
    busClient = new sb.ServiceBusClient(config.ServiceBus.ConnectionString)
    receiver = busClient.createReceiver(queueName, {
      receiveMode: 'receiveAndDelete'
    })
    context.log(`${functionName}: connected to service bus instance ${busClient.fullyQualifiedNamespace}`)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    context.log.error(`${functionName}: unable to connect to service bus at this time:${errorMessage}`)
    throw error
  }

  const setId = `${moment().format('YYYYMMDDHHmmss')}`
  let messageBatch = new Array<sb.ServiceBusReceivedMessage>()
  context.log(`${functionName}: attempting to process log set ${setId}...`)
  try {
    messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    let messageCount = 0
    while (!RA.isNilOrEmpty(messageBatch)) {
      context.log(`${functionName}: adding ${messageBatch.length} log messages...`)
      const logService = new LogService()
      await logService.create(setId, messageBatch)
      messageCount += messageBatch.length
      messageBatch = await receiver.receiveMessages(config.PsReportLogWriter.MessagesPerBatch)
    }
    context.log(`${functionName}: processed ${messageCount} messages...`)
    await disconnect()
    finish(start, context)
  } catch (error) {
    context.log.error(error)
    throw error
  }
}

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default funcImplementation
