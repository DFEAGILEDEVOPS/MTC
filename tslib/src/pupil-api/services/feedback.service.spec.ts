import { PupilFeedbackService } from './feedback.service'
import type { IServiceBusQueueService, IServiceBusQueueMessage } from '../../azure/service-bus.queue.service'
import { ServiceBusQueueNames } from '../../azure/service-bus-queue.names'

describe('Pupil Feedback Service', () => {
  let sut: PupilFeedbackService
  let serviceBusQueueServiceMock: IServiceBusQueueService

  class ServiceBusQueueServiceMock implements IServiceBusQueueService {
    async dispatch (message: IServiceBusQueueMessage, queueName: string): Promise<void> {}
    async getActiveMessageCount (queueName: ServiceBusQueueNames): Promise<number> {
      throw new Error('Method not implemented.')
    }
  }

  beforeEach(() => {
    serviceBusQueueServiceMock = new ServiceBusQueueServiceMock()
    sut = new PupilFeedbackService(serviceBusQueueServiceMock)
  })

  test('message is dispatched onto correct queue', async () => {
    jest.spyOn(serviceBusQueueServiceMock, 'dispatch').mockResolvedValue()
    const payload = { test: 'test' }
    await sut.putFeedbackOnQueue(payload)
    expect(serviceBusQueueServiceMock.dispatch).toHaveBeenCalledWith({ body: payload }, ServiceBusQueueNames.pupilFeedback)
  })
})
