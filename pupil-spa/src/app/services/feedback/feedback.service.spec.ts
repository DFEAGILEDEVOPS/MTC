import { TestBed, inject } from '@angular/core/testing';
import { HttpModule, Response, ResponseOptions, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { FeedbackService } from './feedback.service';
import { StorageService } from '../storage/storage.service';

let feedbackService: FeedbackService;
let storageService: StorageService;
let mockBackend: MockBackend;

describe('FeedService', () => {
  beforeEach(() => {

    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        FeedbackService,
        StorageService,
        { provide: XHRBackend, useClass: MockBackend }
      ]
    });

    feedbackService = injector.get(FeedbackService);
    storageService = injector.get(StorageService);
    mockBackend = injector.get(XHRBackend);
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

    spyOn(storageService, 'getItem');
    feedbackService.postFeedback().then(() => {
      expect(storageService.getItem).toHaveBeenCalledTimes(2);
    });
  });
});
