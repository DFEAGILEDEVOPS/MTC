import { ServiceBusQueueService, type IServiceBusQueueService } from '../../azure/service-bus.queue.service'
import { ServiceBusQueueNames } from '../../azure/service-bus-queue.names'

export interface IPupilFeedbackService {
  putFeedbackOnQueue(payload: any): Promise<void>
}

export class PupilFeedbackService implements IPupilFeedbackService {
  private readonly serviceBusQueueService: IServiceBusQueueService

  constructor (serviceBusQueueService?: IServiceBusQueueService) {
    if (serviceBusQueueService === undefined) {
      serviceBusQueueService = new ServiceBusQueueService()
    }
    this.serviceBusQueueService = serviceBusQueueService
  }

  async putFeedbackOnQueue (payload: any): Promise<void> {
    await this.serviceBusQueueService.dispatch({ body: payload }, ServiceBusQueueNames.pupilFeedback)
  }
}
