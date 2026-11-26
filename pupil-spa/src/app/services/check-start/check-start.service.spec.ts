import { TestBed } from '@angular/core/testing'
import { CheckStartService } from './check-start.service'
import { StorageService } from '../storage/storage.service'
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service'
import { AuditService } from '../audit/audit.service'
import { TokenService } from '../token/token.service'
import { AppConfigService, loadConfigMockService } from '../config/config.service'
import { APP_INITIALIZER } from '@angular/core'
import { HttpService } from '../http/http.service'

let checkStartService: CheckStartService
let tokenService: TokenService
let azureQueueServiceSpy: {
  addMessageToQueue: jasmine.Spy
};
let auditService: AuditService
let storageService: StorageService
let httpServiceSpy: { post: jasmine.Spy }

describe('CheckStartService', () => {
  beforeEach(() => {
    azureQueueServiceSpy = {
      addMessageToQueue: jasmine.createSpy('addMessageToQueue')
    }
    httpServiceSpy = { post: jasmine.createSpy('post').and.resolveTo({}) }
    const inject = TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
          { provide: AzureQueueService, useValue: azureQueueServiceSpy },
          { provide: HttpService, useValue: httpServiceSpy },
          TokenService,
          AuditService,
          CheckStartService,
          StorageService
        ]
      }
    )
    checkStartService = inject.inject(CheckStartService)
    tokenService = inject.inject(TokenService)
    storageService = inject.inject(StorageService)
    auditService = inject.inject(AuditService)
    checkStartService.checkStartAPIErrorDelay = 100
    checkStartService.checkStartAPIErrorMaxAttempts = 1
    spyOn(storageService, 'getPupil').and.returnValue({
      checkCode: 'abc-def'
    })
  })
  it('should be created', () => {
    expect(checkStartService).toBeTruthy()
  })
  it('sends the check-bound token and attempt id for acknowledgement', async () => {
    spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'signed-token' })
    await checkStartService.acknowledge('attempt-id')
    const [url, body, headers] = httpServiceSpy.post.calls.mostRecent().args
    expect(url).toBe('apiBaseUrl/check-start')
    expect(body).toEqual({ checkCode: 'abc-def', attemptId: 'attempt-id' })
    expect(headers.get('Authorization')).toBe('Bearer signed-token')
  })
  it('submit should call azure queue service successfully and audit successful call', async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry')
    spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token' })
    let actualPayload
    azureQueueServiceSpy.addMessageToQueue.and
      .callFake(async (url: string,
        token: string, payload: object,
        retryConfig: QueueMessageRetryConfig): Promise<void> => { // eslint-disable-line @typescript-eslint/no-unused-vars
        actualPayload = payload
        return Promise.resolve()
      })
    const startButtonClickDateTime = new Date()
    await checkStartService.submit(startButtonClickDateTime)
    expect(addEntrySpy).toHaveBeenCalledTimes(2)
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallSucceeded')
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(1)
    expect(actualPayload.version).toBe(1)
    expect(actualPayload.clientCheckStartedAt).toEqual(startButtonClickDateTime)
  })
  it('submit should call azure queue service service unsuccessfully and audit failure', async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry')
    spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token' })
    azureQueueServiceSpy.addMessageToQueue.and.returnValue(Promise.reject(new Error('error')))
    await checkStartService.submit(new Date())
    expect(addEntrySpy).toHaveBeenCalledTimes(2)
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallFailed')
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(1)
  })
})
