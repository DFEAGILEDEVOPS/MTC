import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { FeedbackService } from './feedback.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';

let azureQueueService: AzureQueueService;
let feedbackService: FeedbackService;
let storageService: StorageService;
let tokenService: TokenService;

describe('FeedbackService', () => {
  beforeEach(() => {

    const injector = TestBed.configureTestingModule({
      imports: [HttpModule],
      providers: [
        AppConfigService,
        {provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true},
        {provide: QUEUE_STORAGE_TOKEN},
        AzureQueueService,
        FeedbackService,
        StorageService,
        TokenService,
        {provide: XHRBackend, useClass: MockBackend}
      ]
    });
    azureQueueService = injector.get(AzureQueueService);
    feedbackService = injector.get(FeedbackService);
    storageService = injector.get(StorageService);
    tokenService = injector.get(TokenService);
  });

  it('should be created', inject([FeedbackService], (service: FeedbackService) => {
    expect(service).toBeTruthy();
  }));
  describe('postFeedback ', () => {
    let storedFeedbackMock;
    let accessTokenMock;
    beforeEach(() => {
      storedFeedbackMock = {
        inputType: {id: 1},
        satisfactionRating: {id: 1},
        comments: 'comments',
        checkCode: 'checkCode'
      };
      accessTokenMock = 'accessToken';
    });
    it('should call postPupilFeedback when featureUseHpa config variable is false',
      inject([FeedbackService], async (service: FeedbackService) => {
        service.featureUseHpa = false;
        spyOn(storageService, 'getItem').and.returnValues(storedFeedbackMock, accessTokenMock);
        spyOn(service, 'postPupilFeedback');
        spyOn(service, 'queueSubmit');
        await service.postFeedback();
        expect(service.queueSubmit).not.toHaveBeenCalled();
        expect(service.postPupilFeedback).toHaveBeenCalled();
        expect(storageService.getItem).toHaveBeenCalledTimes(2);
      }));
    it('should call queueSubmit when featureUseHpa config variable is true',
      inject([FeedbackService], async (service: FeedbackService) => {
        service.featureUseHpa = true;
        spyOn(storageService, 'getItem').and.returnValues(storedFeedbackMock, accessTokenMock);
        spyOn(service, 'postPupilFeedback');
        spyOn(service, 'queueSubmit');
        await service.postFeedback();
        expect(service.queueSubmit).toHaveBeenCalled();
        expect(service.postPupilFeedback).not.toHaveBeenCalled();
        expect(storageService.getItem).toHaveBeenCalledTimes(2);
      }));
    it('should return if feedback is not fetched before making any call',
      inject([FeedbackService], async (service: FeedbackService) => {
        service.featureUseHpa = true;
        spyOn(storageService, 'getItem').and.returnValues(undefined, accessTokenMock);
        spyOn(service, 'postPupilFeedback');
        spyOn(service, 'queueSubmit');
        await service.postFeedback();
        expect(service.queueSubmit).not.toHaveBeenCalled();
        expect(service.postPupilFeedback).not.toHaveBeenCalled();
      }));
  });
  describe('queueSubmit ', () => {
    it('should call azureQueueService addMessage',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token'});
        spyOn(azureQueueService, 'addMessage');
        await service.queueSubmit({});
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
      }));
  });
});
