import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { FeedbackService } from './feedback.service';
import { StorageService } from '../storage/storage.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';

let feedbackService: FeedbackService;
let storageService: StorageService;
let mockBackend: MockBackend;

describe('FeedService', () => {
  beforeEach(() => {

    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        FeedbackService,
        StorageService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });

    feedbackService = injector.get(FeedbackService);
    storageService = injector.get(StorageService);
    mockBackend = injector.get(XHRBackend);

    spyOn(storageService, 'getItem');
  });

  it('should be created', inject([FeedbackService], (service: FeedbackService) => {
    expect(service).toBeTruthy();
  }));

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
