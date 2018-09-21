import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AzureQueueServiceMock } from '../azure-queue/azure-queue.service.mock';
import { FeedbackService } from './feedback.service';
import { StorageService } from '../storage/storage.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';

let feedbackService: FeedbackService;
let storageService: StorageService;
let mockBackend: MockBackend;
let mockQueueService;
const mockFeedbackData = { a: 1 };

describe('FeedService', () => {
  beforeEach(() => {
    mockQueueService = new AzureQueueServiceMock();
    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        FeedbackService,
        StorageService,
        { provide: XHRBackend, useClass: MockBackend },
        { provide: AzureQueueService, useValue: mockQueueService }
      ]
    });

    feedbackService = injector.get(FeedbackService);
    storageService = injector.get(StorageService);
    mockBackend = injector.get(XHRBackend);

    spyOn(storageService, 'getItem');
  });

  it('should be created', () => {
    expect(feedbackService).toBeTruthy();
  });

  describe('#postFeedback', () => {
    it('should call storageService getItem on a successful postFeedback', () => {
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({isSaved: true}),
          status: 200
        })));
      });

      feedbackService.postFeedback().then(() => {
        expect(storageService.getItem).toHaveBeenCalledTimes(2);
      });
    });

    it('should not call storageService getItem on a failing postFeedback', () => {
      mockBackend.connections.subscribe((connection) => {
        connection.mockRespond(new Response(new ResponseOptions({
          body: JSON.stringify({isSaved: false}),
          status: 400
        })));
      });

      feedbackService.postFeedback().then(() => {
        expect(storageService.getItem).not.toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('#postSurveyFeedback', () => {
    it('should get the queue service and encode the json stringified data', async () => {
      spyOn(mockQueueService, 'getQueueService').and.callThrough();
      spyOn(mockQueueService, 'encodeMessage');

      await feedbackService.postSurveyFeedback(mockFeedbackData);

      expect(mockQueueService.getQueueService).toHaveBeenCalled();
      expect(mockQueueService.encodeMessage).toHaveBeenCalledWith(JSON.stringify(mockFeedbackData));
    });

    it('rejects when createMessage returns an error', async (done) => {
      spyOn(mockQueueService, 'getQueueService').and.returnValue({
        createMessage: (queueName, message, cb) => { cb('error'); }
      });

      try {
        await feedbackService.postSurveyFeedback(mockFeedbackData);
        fail('expected to fail');
      } catch (e) {
        done();
      }
    });

    it('resolves when createMessage does not return errors', async (done) => {
      spyOn(mockQueueService, 'getQueueService').and.returnValue({
        createMessage: (queueName, message, cb) => { cb(); }
      });

      try {
        await feedbackService.postSurveyFeedback(mockFeedbackData);
        done();
      } catch (e) {
        fail('expected to resolve');
      }
    });
  });
});
