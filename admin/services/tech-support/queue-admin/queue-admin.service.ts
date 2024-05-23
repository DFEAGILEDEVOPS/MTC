import { ServiceBusClient } from '@azure/service-bus'
const config = require('../../../config')

export type SupportedQueueNames = 'submitted-check' | 'check-sync' | 'check-marker'

export class QueueAdminService {
  async purgeQueue (queueName: SupportedQueueNames): Promise<void> {
    const sbClient = new ServiceBusClient(config.ServiceBus.connectionString)
    try {
      const queueReceiver = sbClient.createReceiver(queueName, { receiveMode: 'receiveAndDelete' })
      await queueReceiver.receiveMessages(10000)
      await queueReceiver.close()
    } finally {
      await sbClient.close()
    }
  }
}
