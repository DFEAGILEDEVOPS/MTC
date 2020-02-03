import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'check-notify'
import * as sb from '@azure/service-bus'
import config from '../../config'
import { ICheckNotificationMessage } from '../check-notifier/check-notification-message'

if (!config.ServiceBus.ConnectionString) {
  throw new Error('ServiceBusConnection env var is required')
}

const busClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.ConnectionString)
const queueClient = busClient.createQueueClient('check-notification')
const receiver = queueClient.createReceiver(sb.ReceiveMode.peekLock)

const batchCheckNotifier: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()
  context.log(`timer triggered at ${start}`)
  const messageBatch = await receiver.receiveMessages(config.ServiceBus.BatchReceiveCount)

  for (let index = 0; index < messageBatch.length; index++) {
    const msg = messageBatch[index]
    const notification = msg.body as ICheckNotificationMessage
    console.log(`processing notification ${notification.notificationType} for check:${notification.checkCode}`)
  }

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default batchCheckNotifier
