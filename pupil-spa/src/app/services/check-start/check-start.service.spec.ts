import { TestBed } from '@angular/core/testing'
import { CheckStartService } from './check-start.service'
import { StorageService } from '../storage/storage.service'
import { AzureQueueService } from '../azure-queue/azure-queue.service'
import { AuditService } from '../audit/audit.service'
import { TokenService } from '../token/token.service'
import { AppConfigService, loadConfigMockService } from '../config/config.service'
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azure-storage'
import { APP_INITIALIZER } from '@angular/core'

let checkStartService: CheckStartService
let tokenService: TokenService
let azureQueueService: AzureQueueService
let auditService: AuditService
let storageService: StorageService

describe('CheckStartService', () => {
  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          { provide: QUEUE_STORAGE_TOKEN, useValue: undefined },
          { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
          TokenService,
          AzureQueueService,
          AuditService,
          CheckStartService,
          StorageService
        ]
      }
    )
    checkStartService = inject.inject(CheckStartService)
    tokenService = inject.inject(TokenService)
    azureQueueService = inject.inject(AzureQueueService)
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
  it('submit should call azure queue service successfully and audit successful call', async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry')
    spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token' })
    let actualPayload
    spyOn(azureQueueService, 'addMessageToQueue').and
      .callFake(async (queueName, url, token, payload, retryConfig) => {
        actualPayload = payload
        return {}
      })
    await checkStartService.submit()
    expect(addEntrySpy).toHaveBeenCalledTimes(2)
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallSucceeded')
    expect(azureQueueService.addMessageToQueue).toHaveBeenCalledTimes(1)
    expect(actualPayload.version).toBe(1)
    expect(actualPayload.clientCheckStartedAt).toBeDefined()
  })
  it('submit should call azure queue service service unsuccessfully and audit failure', async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry')
    spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token' })
    spyOn(azureQueueService, 'addMessageToQueue')
      .and.returnValue(Promise.reject(new Error('error')))
    await checkStartService.submit()
    expect(addEntrySpy).toHaveBeenCalledTimes(2)
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallFailed')
    expect(azureQueueService.addMessageToQueue).toHaveBeenCalledTimes(1)
  })
})
