import { APP_INITIALIZER } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { CheckCompleteService } from './check-complete.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { StorageService } from '../storage/storage.service';
import { TestBed } from '@angular/core/testing';
import { TokenService } from '../token/token.service';
import { AppUsageService } from '../app-usage/app-usage.service';
import { Meta } from '@angular/platform-browser'
import { AuditEntryFactory } from '../audit/auditEntry'
import { ApplicationInsightsService } from '../app-insights/app-insights.service';

let auditService: AuditService;
let azureQueueServiceSpy: {
  addMessageToQueue: jasmine.Spy
};
let checkCompleteService: CheckCompleteService;
let storageService: StorageService;
let tokenService: TokenService;
let appUsageService: AppUsageService;
let metaService: Meta
let appInsightsService: ApplicationInsightsService

describe('CheckCompleteService', () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    azureQueueServiceSpy = {
      addMessageToQueue: jasmine.createSpy('addMessageToQueue')
    }

    const testBed = TestBed.configureTestingModule({
        providers: [
          AppConfigService,
          AuditService,
          CheckCompleteService,
          StorageService,
          TokenService,
          AppUsageService,
          Meta,
          { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
          { provide: Router, useValue: mockRouter },
          { provide: AzureQueueService, useValue: azureQueueServiceSpy },
          AuditEntryFactory
        ]
      }
    );
    metaService = testBed.inject(Meta);
    checkCompleteService = testBed.inject(CheckCompleteService);
    appUsageService = TestBed.inject(AppUsageService);
    tokenService = testBed.inject(TokenService);
    auditService = testBed.inject(AuditService);
    storageService = TestBed.inject(StorageService);
    appInsightsService = TestBed.inject(ApplicationInsightsService);
    checkCompleteService.checkSubmissionApiErrorDelay = 100;
    checkCompleteService.checkSubmissionAPIErrorMaxAttempts = 1;
  });

  it('should be created', () => {
    expect(checkCompleteService).toBeTruthy();
  });

  it('submit should call azure queue service successfully, audit successful call and redirect to check complete page', async () => {
    // test setup
    spyOn(appUsageService, 'store')
    spyOn(storageService, 'getConfig').and.returnValue({
      practice: false
    });
    spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
    const addEntrySpy = spyOn(auditService, 'addEntry');
    spyOn(storageService, 'setPendingSubmission');
    spyOn(storageService, 'setCompletedSubmission');
    const expectedSchoolUUID = 'school_uuid';
    spyOn(storageService, 'getAllItems').and.returnValue({
      pupil: {
        checkCode: 'checkCode'
      },
      school: {
        uuid: expectedSchoolUUID
      }
    });
    let capturedMessage;
    azureQueueServiceSpy.addMessageToQueue.and.callFake((url: string, token: string, message: object, retryConfig: QueueMessageRetryConfig): Promise<void> => {
      capturedMessage = message;
      return Promise.resolve()
    });
    spyOn(checkCompleteService, 'getPayload').and.returnValue({ checkCode: 'checkCode', schoolUUID: expectedSchoolUUID });

    // exec
    await checkCompleteService.submit(Date.now());

    // test
    expect(addEntrySpy).toHaveBeenCalledTimes(2);
    expect(appUsageService.store).toHaveBeenCalledTimes(1);
    expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPICallSucceeded');
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(1);
    expect(capturedMessage).toBeDefined();
    expect(capturedMessage.schoolUUID).toBe(expectedSchoolUUID);
    expect(storageService.setPendingSubmission).toHaveBeenCalledTimes(1);
    expect(storageService.setCompletedSubmission).toHaveBeenCalledTimes(1);
    expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
    expect(checkCompleteService.getPayload).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/check-complete']);
  });

  it('uses checkComplete token by default', async () => {
    spyOn(storageService, 'getConfig').and.returnValue({
      practice: false
    });
    spyOn(appUsageService , 'store');
    spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
    spyOn(storageService, 'setPendingSubmission');
    spyOn(storageService, 'setCompletedSubmission');
    const expectedSchoolUUID = 'school_uuid';
    spyOn(storageService, 'getAllItems').and.returnValue({
      pupil: {
        checkCode: 'checkCode'
      },
      school: {
        uuid: expectedSchoolUUID
      }
    });
    spyOn(checkCompleteService, 'getPayload').and.returnValue({ checkCode: 'checkCode', schoolUUID: expectedSchoolUUID });
    await checkCompleteService.submit(Date.now());
    expect(tokenService.getToken).toHaveBeenCalledWith('checkComplete');
  });

  it(`submit should call azure queue service service unsuccessfully, audit failure
    and redirect to submission failed page`, async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry');
    spyOn(storageService, 'getConfig').and.returnValue({
      practice: false
    });
    spyOn(appUsageService , 'store');
    spyOn(appInsightsService, 'trackException');
    spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
    spyOn(storageService, 'setPendingSubmission');
    spyOn(storageService, 'setCompletedSubmission');
    spyOn(storageService, 'getAllItems').and.returnValue({pupil: {checkCode: 'checkCode'}});
    azureQueueServiceSpy.addMessageToQueue.and.returnValue(Promise.reject(new Error('error')));
    spyOn(checkCompleteService, 'getPayload').and.returnValue({});
    await checkCompleteService.submit(Date.now());
    expect(addEntrySpy).toHaveBeenCalledTimes(2);
    expect(appUsageService.store).toHaveBeenCalledTimes(1);
    expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPIFailed');
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(1);
    expect(storageService.setPendingSubmission).toHaveBeenCalledTimes(0);
    expect(storageService.setCompletedSubmission).toHaveBeenCalledTimes(0);
    expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/submission-failed']);
    expect(appInsightsService.trackException).toHaveBeenCalledTimes(1);
  });

  it(`submit should call azure queue service service when sas token has expired and redirect to session expiry page`, async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry');
    spyOn(storageService, 'getConfig').and.returnValue({
      practice: false
    });
    spyOn(appUsageService , 'store');
    spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
    spyOn(storageService, 'setPendingSubmission');
    spyOn(storageService, 'setCompletedSubmission');
    spyOn(storageService, 'getAllItems').and.returnValue({pupil: {checkCode: 'checkCode'}});
    spyOn(checkCompleteService, 'getPayload').and.returnValue({});
    const sasTokenExpiredError = {
      statusCode: 403,
      authenticationerrordetail: 'Signature not valid in the specified time frame: Start - Expiry - Current'
    };
    azureQueueServiceSpy.addMessageToQueue.and.returnValue(Promise.reject(sasTokenExpiredError));
    await checkCompleteService.submit(Date.now());
    expect(addEntrySpy).toHaveBeenCalledTimes(2);
    expect(appUsageService.store).toHaveBeenCalledTimes(1);
    expect(checkCompleteService.getPayload).toHaveBeenCalledTimes(1);
    expect(addEntrySpy.calls.all()[0].args[0].type).toEqual('CheckSubmissionApiCalled');
    expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('CheckSubmissionAPIFailed');
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(1);
    expect(storageService.setPendingSubmission).toHaveBeenCalledTimes(0);
    expect(storageService.setCompletedSubmission).toHaveBeenCalledTimes(0);
    expect(storageService.getAllItems).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/session-expired']);
  });

  it('submit should return if the app is configured to run in practice mode', async () => {
    const addEntrySpy = spyOn(auditService, 'addEntry');
    spyOn(storageService, 'getConfig').and.returnValue({
      practice: true
    });
    spyOn(appUsageService , 'store');
    spyOn(tokenService, 'getToken');
    spyOn(storageService, 'setPendingSubmission');
    spyOn(storageService, 'setCompletedSubmission');
    spyOn(storageService, 'getAllItems');
    spyOn(checkCompleteService, 'getPayload').and.returnValue({});
    await checkCompleteService.submit(Date.now());
    expect(addEntrySpy).toHaveBeenCalledTimes(0);
    expect(checkCompleteService.getPayload).toHaveBeenCalledTimes(0);
    expect(appUsageService.store).toHaveBeenCalledTimes(1);
    expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalledTimes(0);
    expect(storageService.getAllItems).toHaveBeenCalledTimes(0);
    expect(storageService.setPendingSubmission).toHaveBeenCalledTimes(1);
    expect(storageService.setCompletedSubmission).toHaveBeenCalledTimes(1);
    expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
  });

  describe('getAllEntriesByKey', () => {
      it('stores all items in the corresponding key based category based on timestamp order', () => {
        const localStorageItems = {
          'audit-1': { value: 'value1', clientTimestamp: Date.now() + 500 },
          'audit-2': { value: 'value2', clientTimestamp: Date.now() + 1000 },
          'audit-3': { value: 'value3', clientTimestamp: Date.now() },
        };
        const keyItems = checkCompleteService.getAllEntriesByKey('audit', localStorageItems);
        expect(keyItems[0].value).toBe('value3');
        expect(keyItems[1].value).toBe('value1');
        expect(keyItems[2].value).toBe('value2');
      });

      it('will sub-sort Answers on the monotonic time sequence number if the datetime is the same', () => {
        const t1 = Date.now() - 1500
        const localStorageItems = {
          'audit-1': { value: 'value1', clientTimestamp: t1, monotonicTime: { sequenceNumber: 11 }},
          'audit-2': { value: 'value2', clientTimestamp: t1, monotonicTime: { sequenceNumber: 10 }},
          'audit-3': { value: 'value3', clientTimestamp: Date.now(), monotonicTime: { sequenceNumber: 12 }},
        }
        const keyItems = checkCompleteService.getAllEntriesByKey('audit', localStorageItems);
        expect(keyItems[0].value).toBe('value2');
        expect(keyItems[1].value).toBe('value1');
        expect(keyItems[2].value).toBe('value3');
      })

    it('will sub-sort Audits on the monotonic time sequence number if the datetime is the same', () => {
      const t1 = Date.now() - 1500
      const localStorageItems = {
        'audit-1': { value: 'value1', clientTimestamp: t1, data: { monotonicTime: { sequenceNumber: 11 }}},
        'audit-2': { value: 'value2', clientTimestamp: t1, data: { monotonicTime: { sequenceNumber: 10 }}},
        'audit-3': { value: 'value3', clientTimestamp: Date.now(), data: { monotonicTime: { sequenceNumber: 12 }}},
      }
      const keyItems = checkCompleteService.getAllEntriesByKey('audit', localStorageItems);
      expect(keyItems[0].value).toBe('value2');
      expect(keyItems[1].value).toBe('value1');
      expect(keyItems[2].value).toBe('value3');
    })
  });

  describe('getPayload', () => {
    const buildVersion = 'buildVersion'
    beforeEach(() => {
      metaService.addTag({
        name: 'build:number',
        content: buildVersion
      })
    })
    it('stores all items in the corresponding key based category based on timestamp order', () => {
      const localStorageItems = {
        'audit-1': { value: 'value1', clientTimestamp: Date.now() + 500 },
        'audit-2': { value: 'value2', clientTimestamp: Date.now() + 1000 },
        'audit-3': { value: 'value3', clientTimestamp: Date.now() },
        'pupil': {
          'checkCode': 'checkCode'
        },
        'school': {
          'uuid': 'schoolUUID'
        }
      };
      const keyEntries = [
        { value: 'value1', clientTimestamp: Date.now() + 500 },
        { value: 'value2', clientTimestamp: Date.now() + 1000 },
        { value: 'value3', clientTimestamp: Date.now() }
      ];
      spyOn(checkCompleteService, 'getAllEntriesByKey').and.returnValue(keyEntries);
      const payload = checkCompleteService.getPayload(localStorageItems);
      expect(payload['audit']).toEqual(keyEntries);
      expect(payload['checkCode']).toEqual('checkCode');
      expect(payload['schoolUUID']).toEqual('schoolUUID');
      expect(payload['buildVersion']).toEqual(buildVersion);
      expect(Object.keys(payload))
        .toEqual(['checkCode', 'schoolUUID', 'buildVersion', 'config', 'device', 'pupil',
          'questions', 'school', 'tokens', 'audit', 'inputs', 'answers']);
    });
  });
});
