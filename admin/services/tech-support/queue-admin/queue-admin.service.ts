import { ServiceBusQueueAdminDataService, type IServiceBusQueueAdminDataService } from './queue-admin.data.service'
const config = require('../../../config')
// TODO find enum or create one?
export type SupportedQueueNames = 'submitted-check' | 'check-sync' | 'check-marker'

export class QueueAdminService {
  constructor (private readonly queueAdminDataService?: IServiceBusQueueAdminDataService) {
    if (queueAdminDataService === undefined) {
      this.queueAdminDataService = new ServiceBusQueueAdminDataService()
    } else {
      this.queueAdminDataService = queueAdminDataService
    }
  }

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
