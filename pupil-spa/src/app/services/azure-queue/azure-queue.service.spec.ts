import { TestBed, waitForAsync } from '@angular/core/testing'
import { APP_CONFIG, IAppConfig, loadConfigMockService } from '../config/config.service'
import { AzureQueueService } from './azure-queue.service'
import { APP_INITIALIZER } from '@angular/core'
import { HttpService } from '../http/http.service'

describe('AzureQueueService', () => {

  let sut: AzureQueueService
  let initialProductionFlag: boolean
  let httpServiceSpy: { post: jasmine.Spy }

  beforeEach(waitForAsync(() => {
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post'])
    TestBed.configureTestingModule({
      providers: [
        AzureQueueService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: HttpService, useValue: httpServiceSpy }
      ]
    })
    .compileComponents()
    initialProductionFlag = APP_CONFIG.production
    sut = TestBed.inject(AzureQueueService)
  }))

  afterEach(() => {
    (<IAppConfig>APP_CONFIG).production = initialProductionFlag
  })

  describe('sets message TTL to no expiry', () => {
    it('should set TTL option to -1 when putting message on queue', async () => {
      let actualUrl = ''
      httpServiceSpy.post.and.callFake((queueUrl: string, message: any, headers: any) => {
        actualUrl = queueUrl
      })
      const queueName = 'my-queue'
      const payload = { payloadItem: 'payloadItem' }
      await sut.addMessageToQueue(queueName,
        'url',
        'token',
        payload,
        {
          MaxAttempts: 1,
          DelayBetweenRetries: 10000
        }
      )
      expect(actualUrl).toContain('messagettl=-1')
    })
  })

  describe('when the production flag is disabled', () => {
    beforeEach(() => {
      (<IAppConfig>APP_CONFIG).production = false
    })

    it('should not try to fallback when failing to send a message', async () => {
      httpServiceSpy.post.and.throwError(new Error('fail'))
      try {
        await sut.addMessageToQueue('queue',
          'url',
          'token',
          { payloadItem: 'payloadItem' },
          {
            MaxAttempts: 1,
            DelayBetweenRetries: 10000,
          }
        )
        fail('should have failed')
      } catch (e) {
        expect(httpServiceSpy.post).toHaveBeenCalledTimes(1)
      }
    })

    it('should successfully send a message to the queue', async () => {

      await sut.addMessageToQueue('queue',
        'url',
        'token',
        { payloadItem: 'payloadItem' },
        {
          MaxAttempts: 1,
          DelayBetweenRetries: 10000,
        }
      )
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1)
    })
  })

  describe('when the production flag is enabled', () => {
    beforeEach(() => {
      (<IAppConfig>APP_CONFIG).production = true
    })

    it('should try to fallback when failing to send a message', async () => {
      httpServiceSpy.post.and.throwError(new Error('fail'))
      try {
        await sut.addMessageToQueue('queue',
          'url',
          'token',
          { payloadItem: 'payloadItem' },
          {
            MaxAttempts: 1,
            DelayBetweenRetries: 10000,
          }
        )
        fail('should have failed')
      } catch (e) {
        expect(httpServiceSpy.post).toHaveBeenCalledTimes(2)
      }
    })

    it('should successfully send a message to the queue', async () => {
      await sut.addMessageToQueue('queue',
        'url',
        'token',
        { payloadItem: 'payloadItem' },
        {
          MaxAttempts: 1,
          DelayBetweenRetries: 10000,
        }
      )
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1)
    })
  })
})
