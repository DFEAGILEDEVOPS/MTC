import { TestBed, inject } from '@angular/core/testing'
import { APP_INITIALIZER } from '@angular/core'
import { FeedbackService, IPupilFeedbackMessage } from './feedback.service'
import { StorageService } from '../storage/storage.service'
import { TokenService } from '../token/token.service'
import { AppConfigService, loadConfigMockService } from '../config/config.service'
import { HttpService } from '../http/http.service'

let storageService: StorageService
let tokenService: TokenService

describe('FeedbackService', () => {
  let httpServiceSpy: {
    post: jasmine.Spy
  }
  beforeEach(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post'])
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: HttpService, useValue: httpServiceSpy },
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
    let httpServiceSpy: {
      post: jasmine.Spy
    }
    beforeEach(() => {
      storedFeedbackMock = {
        satisfactionRating: { id: 1 },
        comments: 'comments',
        checkCode: 'checkCode'
      }

    })
    it('should call queueSubmit',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(storageService, 'getFeedback').and.returnValues(storedFeedbackMock)
        spyOn(service, 'submitFeedback')
        await service.postFeedback()
        expect(service.submitFeedback).toHaveBeenCalled()
        expect(storageService.getFeedback).toHaveBeenCalledTimes(1)
      }))
    it('should return if feedback is not fetched before making any call',
      inject([FeedbackService], async (service: FeedbackService) => {
        spyOn(storageService, 'getFeedback').and.returnValues(undefined)
        spyOn(service, 'submitFeedback')
        await service.postFeedback()
        expect(service.submitFeedback).not.toHaveBeenCalled()
      }))

    it('should post to payload url with valid jwt auth header from payload', async () => {
      inject([FeedbackService], async (service: FeedbackService) => {
        const payloadJwt = 'my-jwt-token'
        const payloadUrl = 'http://my-url'
        const payload: IPupilFeedbackMessage = {
          version: 3,
          feedback: 'the feedback',
          checkCode: 'check-code'
        }
        httpServiceSpy.post.and.callFake((url: string, payload: any, headers: any) => {
          expect(headers.get('Authorization')).toEqual(`Bearer ${payloadJwt}`)
          expect(url).toEqual(payloadUrl)
        })
        await service.submitFeedback(payload)
        expect(httpServiceSpy.post).toHaveBeenCalled()
      })
    })
  })
})
