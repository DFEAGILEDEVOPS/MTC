import { TestBed } from '@angular/core/testing';

import { AuditService } from '../audit/audit.service';
import { AuditEntryMock, APICalled, APICallFailed, APICallSucceeded } from '../audit/auditEntry.mock';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { AzureQueueSubmissionService } from './azure-queue-submission';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';

describe('AzureQueueSubmissionService', () => {
  let auditService: AuditService;
  let azureQueueService: AzureQueueService;
  let azureQueueSubmissionService: AzureQueueSubmissionService;
  let tokenService: TokenService;

  beforeEach(() => {
    const inject = TestBed.configureTestingModule({
      providers: [
        {provide: QUEUE_STORAGE_TOKEN},
        AuditService,
        AzureQueueService,
        AzureQueueSubmissionService,
        StorageService,
        TokenService
      ]
    });
    tokenService = inject.get(TokenService);
    auditService = inject.get(AuditService);
    azureQueueService = inject.get(AzureQueueService);
    azureQueueSubmissionService = inject.get(AzureQueueSubmissionService);
  });
  describe('submitAzureQueueMessage', () => {
    describe('When featureUseHpa is enabled', () => {
      beforeEach(() => {
        azureQueueSubmissionService.featureUseHpa = true;
      });
      it('should call azureQueueService addMessage method and audit log the successful outcome', async () => {
        const addEntrySpy = spyOn(auditService, 'addEntry');
        spyOn(azureQueueService, 'addMessage');
        spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
        const payload = {};
        const retryConfig = {};
        const messageType = 'pupilPreferences';
        const auditMessages = {
          APICalled,
          APICallSucceeded,
          APICallFailed
        };
        await azureQueueSubmissionService.submitAzureQueueMessage(payload, retryConfig, messageType, auditMessages);
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
        expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('APICallSucceeded');
      });
      it('should audit log the error when azureQueueService addMessage fails', async () => {
        const addEntrySpy = spyOn(auditService, 'addEntry');
        spyOn(azureQueueService, 'addMessage').and.returnValue(Promise.reject(new Error('error')));
        spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
        const payload = {};
        const retryConfig = {};
        const messageType = 'pupilPreferences';
        const auditMessages = {
          APICalled,
          APICallSucceeded,
          APICallFailed
        };
        await azureQueueSubmissionService.submitAzureQueueMessage(payload, retryConfig, messageType, auditMessages);
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
        expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('APICallFailed');
      });
    });
    describe('when featureHpa is not enabled', () => {
      beforeEach(() => {
        azureQueueSubmissionService.featureUseHpa = false;
      });
      it('should not call azureQueueService addMessage', async () => {
        spyOn(azureQueueService, 'addMessage');
        spyOn(tokenService, 'getToken');
        spyOn(auditService, 'addEntry');
        const payload = {};
        const retryConfig = {};
        const messageType = 'pupilPreferences';
        const auditMessages = {
          APICalled,
          APICallSucceeded,
          APICallFailed
        };
        await azureQueueSubmissionService.submitAzureQueueMessage(payload, retryConfig, messageType, auditMessages);
        expect(auditService.addEntry).not.toHaveBeenCalled();
        expect(tokenService.getToken).not.toHaveBeenCalled();
        expect(azureQueueService.addMessage).not.toHaveBeenCalled();
      });
    });
  });
});
