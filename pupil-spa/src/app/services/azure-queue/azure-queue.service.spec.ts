import { async, TestBed } from '@angular/core/testing';
import { APP_CONFIG, IAppConfig } from '../config/config.service';
import { IQueueService, QUEUE_STORAGE_TOKEN } from './azureStorage';
import { AzureQueueService } from './azure-queue.service';

describe('AzureQueueService', () => {

  let azureQueueService: AzureQueueService;
  let initialProductionFlag;

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
    initialProductionFlag = APP_CONFIG.production;
  });

  afterEach( () => {
    (<IAppConfig>APP_CONFIG).production = initialProductionFlag;
  });

  describe('when the production flag is disabled', () => {
    beforeEach(() => {
      (<IAppConfig>APP_CONFIG).production = false;
    });

    it('should not try to fallback when failing to send a message', async () => {
      const queueServiceMock: IQueueService = {
        createMessage: (
          queueName: string,
          encodedMessage: string,
        ) => Promise.reject(false),
        performRequest: () => {},
        withFilter: (qs: IQueueService) => qs
      };
      const textBase64QueueMessageEncoderMock = {
        encode: (data: string) => 'encodedMessage',
      };
      spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceMock);
      // @ts-ignore
      spyOn(azureQueueService, 'getTextBase64QueueMessageEncoder').and.returnValue(textBase64QueueMessageEncoderMock);
      try {
        await azureQueueService.addMessage('queue',
          'url',
          'token',
          { payloadItem: 'payloadItem' },
          {
            maxRetryCount: 1,
            durationBetweenRetriesMs: 10000,
          }
        );
        fail('should have failed');
      } catch (e) {
        expect(azureQueueService.initQueueService).toHaveBeenCalledTimes(1);
      }
    });

    it('should successfully send a message to the queue', async () => {
      const queueServiceMock: IQueueService = {
        createMessage: (
          queueName: string,
          encodedMessage: string,
        ) => Promise.resolve({ messageId: '1' }),
        performRequest: () => {},
        withFilter: (qs: IQueueService) => qs
      };
      const textBase64QueueMessageEncoderMock = {
        encode: () => 'encodedMessage'
      };
      spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceMock);
      // @ts-ignore
      spyOn(azureQueueService, 'getTextBase64QueueMessageEncoder').and.returnValue(textBase64QueueMessageEncoderMock);
      const message = await azureQueueService.addMessage('queue',
        'url',
        'token',
        { payloadItem: 'payloadItem' },
        {
          maxRetryCount: 1,
          durationBetweenRetriesMs: 10000,
        }
      );
      expect(message).toEqual({ messageId: '1' });
      expect(azureQueueService.initQueueService).toHaveBeenCalledTimes(1);
    });
  });

  describe('when the production flag is enabled', () => {
    beforeEach(() => {
      (<IAppConfig>APP_CONFIG).production = true;
    });

    it('should try to fallback when failing to send a message', async () => {
      const queueServiceMock: IQueueService = {
        createMessage: (
          queueName: string,
          encodedMessage: string,
        ) => Promise.reject(false),
        performRequest: () => {},
        withFilter: (qs: IQueueService) => qs
      };
      const textBase64QueueMessageEncoderMock = {
        encode: () => 'encodedMessage'
      };
      spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceMock);
      // @ts-ignore
      spyOn(azureQueueService, 'getTextBase64QueueMessageEncoder').and.returnValue(textBase64QueueMessageEncoderMock);
      try {
        await azureQueueService.addMessage('queue',
          'url',
          'token',
          { payloadItem: 'payloadItem' },
          {
            maxRetryCount: 1,
            durationBetweenRetriesMs: 10000,
          }
        );
        fail('should have failed');
      } catch (e) {
        expect(azureQueueService.initQueueService).toHaveBeenCalledTimes(2);
      }
    });

    it('should successfully send a message to the queue', async () => {
      const queueServiceMock: IQueueService = {
        createMessage: (
          queueName: string,
          encodedMessage: string,
        ) => Promise.resolve({ messageId: '1' }),
        performRequest: () => {},
        withFilter: (qs: IQueueService) => qs
      };
      const textBase64QueueMessageEncoderMock = {
        encode: () => 'encodedMessage'
      };
      spyOn(azureQueueService, 'initQueueService').and.returnValue(queueServiceMock);
      // @ts-ignore
      spyOn(azureQueueService, 'getTextBase64QueueMessageEncoder').and.returnValue(textBase64QueueMessageEncoderMock);
      const message = await azureQueueService.addMessage('queue',
        'url',
        'token',
        { payloadItem: 'payloadItem' },
        {
          maxRetryCount: 1,
          durationBetweenRetriesMs: 10000,
        }
      );
      expect(message).toEqual({ messageId: '1' });
      expect(azureQueueService.initQueueService).toHaveBeenCalledTimes(1);
    });
  });
});
