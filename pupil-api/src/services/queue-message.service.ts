
import * as sb from '@azure/service-bus'
import config from '../config'

export interface IQueueMessageService {
  dispatch (message: IServiceBusQueueMessage): Promise<void>
}

export interface IServiceBusQueueMessage {
  body: any
}

export class SbQueueMessageService implements IQueueMessageService {

  private sender: sb.Sender

  constructor () {
    const sbClient = sb.ServiceBusClient.createFromConnectionString(config.ServiceBus.connectionString)
    const sbQueueClient = sbClient.createQueueClient('pupil-login')
    this.sender = sbQueueClient.createSender()
  }

  async dispatch (message: IServiceBusQueueMessage): Promise<void> {
    return this.sender.send(message)
  }
}
