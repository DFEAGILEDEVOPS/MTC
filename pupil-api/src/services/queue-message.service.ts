
import * as sb from '@azure/service-bus'
import config from '../config'

export interface IQueueMessageService {
  dispatch (message: IServiceBusQueueMessage): Promise<void>
}

export interface IServiceBusQueueMessage {
  body: any
}

export class SbQueueMessageService implements IQueueMessageService {
  private readonly sender: sb.Sender

  constructor () {
    if (config.ServiceBus.connectionString === undefined) {
      throw new Error('Azure Service Bus Connection String missing')
    }
    const sbClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.connectionString)
    const sbQueueClient = sbClient.createQueueClient('pupil-login')
    this.sender = sbQueueClient.createSender()
  }

  async dispatch (message: IServiceBusQueueMessage): Promise<void> {
    return this.sender.send(message)
  }
}
