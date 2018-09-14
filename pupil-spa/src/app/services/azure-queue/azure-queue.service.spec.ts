import { async, TestBed } from '@angular/core/testing';
import { IQueueService, QUEUE_STORAGE_TOKEN } from './azureStorage';
import { AzureQueueService } from './azure-queue.service';

describe('AzureQueueService', () => {

  let azureQueueService: AzureQueueService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        AzureQueueService,
        { provide: QUEUE_STORAGE_TOKEN },
      ]
    })
    .compileComponents();
  }));
  beforeEach( () => {
    azureQueueService = TestBed.get(AzureQueueService);
  });
  it('should successfully send a message to the queue', async () => {
    const queueServiceMock: IQueueService = {
      createMessage: (
        queueName: string,
        encodedMessage: string,
      ) => ({ messageId: '1' }),
      performRequest: () => {},
      withFilter: () => this
    };
    const textBase64QueueMessageEncoderMock = {
      encode: () => 'encodedMessage'
    };
    spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceMock);
    spyOn(azureQueueService, 'getTextBase64QueueMessageEncoder').and.returnValue(textBase64QueueMessageEncoderMock);
    const message = await azureQueueService.addMessage('queue',
      'url',
      'token',
      { payloadItem: 'payloadItem' },
      {
        checkStartAPIErrorMaxAttempts: 1,
        checkStartAPIErrorDelay: 10000,
      }
    );
    expect(message).toEqual({ messageId: '1' });
    expect(azureQueueService.initQueueService).toHaveBeenCalled();
  });
});
