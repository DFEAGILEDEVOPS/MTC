import { CheckSubmitService } from './check-submit.service.js'
import { type IServiceBusQueueService } from '../azure/service-bus.queue.service.js'
import { ServiceBusQueueNames } from '../azure/service-bus-queue.names.js'

const SbQueueServiceMock = jest.fn<IServiceBusQueueService, any>(() => ({
  dispatch: jest.fn(),
  getActiveMessageCount: jest.fn()
}))

let sut: CheckSubmitService
let queueServiceMock: IServiceBusQueueService

describe('check submit service', () => {
  beforeEach(() => {
    queueServiceMock = new SbQueueServiceMock()
    sut = new CheckSubmitService(queueServiceMock)
  })

  test('throws an error if the payload is undefined', async () => {
    await expect(sut.submit(undefined)).rejects.toThrow('payload is required')
  })

  test('dispatches the payload onto the relevant queue as a message', async () => {
    const checkCode = 'ff69943f-143f-497a-b754-04d8376e2314'
    const payload = {
      checkCode
    }
    jest.spyOn(queueServiceMock, 'dispatch')
    await sut.submit(payload)
    expect(queueServiceMock.dispatch).toHaveBeenCalledWith({
      body: payload
    }, ServiceBusQueueNames.checkSubmission)
  })
})
