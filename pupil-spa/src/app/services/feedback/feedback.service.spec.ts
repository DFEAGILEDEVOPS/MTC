import { TestBed, inject } from '@angular/core/testing'
import { APP_INITIALIZER } from '@angular/core'
import { AzureQueueService, IAzureQueueService } from '../azure-queue/azure-queue.service'
import { FeedbackService } from './feedback.service'
import { StorageService } from '../storage/storage.service'
import { TokenService } from '../token/token.service'
import { AppConfigService, loadConfigMockService } from '../config/config.service'

let storageService: StorageService
let tokenService: TokenService
let azureQueueServiceSpy: IAzureQueueService


describe('FeedbackService', () => {
  beforeEach(() => {
    azureQueueServiceSpy = jasmine.createSpyObj('AzureQueueService', ['addMessageToQueue'])
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: AzureQueueService, useValue: azureQueueServiceSpy },
        FeedbackService,
        StorageService,
        TokenService
      ]
    })
    storageService = injector.inject(StorageService)
    tokenService = injector.inject(TokenService)
  })

  it('should be created', inject([FeedbackService], (service: FeedbackService) => {
    expect(service).toBeTruthy()
  }))
  describe('postFeedback ', () => {
    let storedFeedbackMock
    beforeEach(() => {
      storedFeedbackMock = {
        inputType: { id: 1 },
        satisfactionRating: { id: 1 },
        comments: 'comments',
        checkCode: 'checkCode'
      }

    })
    it('should call queueSubmit',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(storageService, 'getFeedback').and.returnValues(storedFeedbackMock)
        spyOn(service, 'queueSubmit')
        await service.postFeedback()
        expect(service.queueSubmit).toHaveBeenCalled()
        expect(storageService.getFeedback).toHaveBeenCalledTimes(1)
      }))
    it('should return if feedback is not fetched before making any call',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(storageService, 'getFeedback').and.returnValues(undefined)
        spyOn(service, 'queueSubmit')
        await service.postFeedback()
        expect(service.queueSubmit).not.toHaveBeenCalled()
      }))
  })
  describe('queueSubmit ', () => {
    it('should call azureQueueService addMessage',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token' })
        await service.queueSubmit({})
        expect(tokenService.getToken).toHaveBeenCalled()
        expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalled()
      }))
  })
})
