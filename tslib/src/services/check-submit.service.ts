import { ServiceBusQueueNames } from '../azure/service-bus-queue.names.js'
import { ServiceBusQueueService, type IServiceBusQueueService } from '../azure/service-bus.queue.service.js'

export interface ICheckSubmitService {
  submit (payload: any): Promise<void>
}

export class CheckSubmitService {
  private readonly queueService: IServiceBusQueueService

  constructor (queueService?: IServiceBusQueueService) {
    if (queueService === undefined) {
      queueService = new ServiceBusQueueService()
    }
    this.queueService = queueService
  }

  async submit (payload: any): Promise<void> {
    if (payload === undefined) {
      throw new Error('payload is required')
    }
    return this.queueService.dispatch({ body: payload }, ServiceBusQueueNames.checkSubmission)
  }
}
