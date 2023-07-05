import { ServiceBusClient } from '@azure/service-bus'
import type { ServiceBusSender } from '@azure/service-bus'
import config from '../config'

export interface IQueueMessageService {
  dispatch (message: IServiceBusQueueMessage): Promise<void>
}

export interface IServiceBusQueueMessage {
  body: any
}

export class SbQueueMessageService implements IQueueMessageService {
  private readonly sender: ServiceBusSender
  private readonly queueName = 'pupil-login'

  constructor () {
    if (config.ServiceBus.connectionString === undefined) {
      throw new Error('Azure Service Bus Connection String missing')
    }
    const serviceBusClient = new ServiceBusClient(config.ServiceBus.connectionString)
    this.sender = serviceBusClient.createSender(this.queueName)
  }

  async dispatch (message: IServiceBusQueueMessage): Promise<void> {
    return this.sender.sendMessages(message)
  }
}
