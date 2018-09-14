import { async, TestBed } from '@angular/core/testing';
import { QUEUE_STORAGE_TOKEN } from './azureStorage';
import { queueStorageStub, queueServiceStub } from './queue-storage-stub';
import { AzureQueueService } from './azure-queue.service';

describe('AzureQueueService', () => {

  let azureQueueService: AzureQueueService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        AzureQueueService,
        { provide: QUEUE_STORAGE_TOKEN, useValue: queueStorageStub },
      ]
    })
    .compileComponents();
  }));
  beforeEach( () => {
    azureQueueService = TestBed.get(AzureQueueService);
  });
  it('should successfully send a message to the queue', async () => {
    spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceStub);
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
