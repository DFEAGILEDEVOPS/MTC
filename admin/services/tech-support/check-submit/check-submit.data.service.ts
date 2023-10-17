import { ServiceBusClient, type ServiceBusMessage, type ServiceBusSender } from '@azure/service-bus'
const config = require('../../../config')

export class CheckSubmitDataService {
  private static sbClient: ServiceBusClient
  private static sbSender: ServiceBusSender

  public static async submitCheckMessageV3 (message: string | Record<string, any>): Promise<void> {
    if (this.sbClient === undefined || this.sbSender === undefined) {
      this.sbClient = new ServiceBusClient(config.ServiceBus.connectionString)
      this.sbSender = this.sbClient.createSender('check-submission')
    }
    const msg: ServiceBusMessage = {
      body: message
    }
    return this.sbSender.sendMessages(msg)
  }
}
