import { ServiceBusClient, type ServiceBusSender } from '@azure/service-bus'
const config = require('../../../config')

export class CheckSubmitDataService {
  private static sbClient: ServiceBusClient
  private static sbSender: ServiceBusSender

  public static async submitCheckMessageV3 (message: string): Promise<void> {
    if (this.sbClient === undefined || this.sbSender === undefined) {
      this.sbClient = new ServiceBusClient(config.ServiceBus.connectionString)
      this.sbSender = this.sbClient.createSender('check-submission')
    }
    return this.sbSender.sendMessages({
      body: message
    })
  }
}
