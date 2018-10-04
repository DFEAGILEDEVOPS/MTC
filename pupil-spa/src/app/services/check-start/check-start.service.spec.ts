import { TestBed } from '@angular/core/testing';
import { CheckStartService } from './check-start.service';
import { SubmissionService } from '../submission/submission.service';
import { SubmissionServiceMock } from '../submission/submission.service.mock';
import { StorageService } from '../storage/storage.service';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AuditService } from '../audit/audit.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';
import { APP_INITIALIZER } from '@angular/core';

let checkStartService: CheckStartService;
let mockStorageService: StorageServiceMock;
let submissionService: SubmissionService;
let tokenService: TokenService;
let azureQueueService: AzureQueueService;
let auditService: AuditService;

describe('CheckStartService', () => {
  beforeEach(() => {
    mockStorageService = new StorageServiceMock();
    const inject = TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          { provide: StorageService, useValue: mockStorageService },
          { provide: SubmissionService, useClass: SubmissionServiceMock },
          { provide: QUEUE_STORAGE_TOKEN },
          { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
          TokenService,
          AzureQueueService,
          AuditService,
          CheckStartService,
        ]
      }
    );
    checkStartService = inject.get(CheckStartService);
    submissionService = inject.get(SubmissionService);
    tokenService = inject.get(TokenService);
    azureQueueService = inject.get(AzureQueueService);
    auditService = inject.get(AuditService);
    checkStartService.checkStartAPIErrorDelay = 100;
    checkStartService.checkStartAPIErrorMaxAttempts = 1;
  });
  it('should be created', () => {
    expect(checkStartService).toBeTruthy();
  });
  describe('when featureUseHpa toggle is off', () => {
    beforeEach(() => {
      checkStartService.featureUseHpa = false;
    });
    it('submit should call submission service successfully and audit successful call', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(submissionService, 'submitCheckStartData')
        .and.returnValue({ toPromise: () => Promise.resolve() });
      await checkStartService.submit();
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckStartedAPICallSucceeded');
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedApiCalled');
      expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
    });
    it('submit should call submission service unsuccessfully and audit failure', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(submissionService, 'submitCheckStartData')
        .and.returnValue({ toPromise: () => Promise.reject(new Error('error')) });
      await checkStartService.submit();
      expect(addEntrySpy).toHaveBeenCalledTimes(1);
      expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckStartedApiCalled');
      expect(submissionService.submitCheckStartData).toHaveBeenCalledTimes(1);
    });
  });
  describe('when featureUseHpa toggle is on', () => {
    beforeEach(() => {
      checkStartService.featureUseHpa = true;
      spyOn(mockStorageService, 'getItem').and.returnValue({
        checkCode: 'abc-def'
      });
    });
    it('submit should call azure queue service successfully and audit successful call', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token'});
      spyOn(azureQueueService, 'addMessage')
        .and.returnValue(Promise.resolve());
      await checkStartService.submit();
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallSucceeded');
      expect(azureQueueService.addMessage).toHaveBeenCalledTimes(1);
    });
    it('submit should call azure queue service service unsuccessfully and audit failure', async () => {
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(tokenService, 'getToken').and.returnValue({ url: 'url', token: 'token'});
      spyOn(azureQueueService, 'addMessage')
        .and.returnValue(Promise.reject(new Error('error')));
      await checkStartService.submit();
      expect(addEntrySpy).toHaveBeenCalledTimes(2);
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckStartedAPICallFailed');
      expect(azureQueueService.addMessage).toHaveBeenCalledTimes(1);
    });
  });
});
