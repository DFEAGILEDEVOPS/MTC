import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { AzureQueueService, IRetryConfig } from '../azure-queue/azure-queue.service';
import { PupilPrefsService } from './pupil-prefs.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';
import { AuditService } from '../audit/audit.service';
import { QuestionService } from '../question/question.service';
import { QuestionServiceMock } from '../question/question.service.mock';
import { AccessArrangements } from '../../access-arrangements';

let azureQueueService: AzureQueueService;
let pupilPrefsService: PupilPrefsService;
let auditService: AuditService;
let mockQuestionService;
let tokenService: TokenService;
let storageService: StorageService;
let storedPrefs;

describe('PupilPrefsService', () => {
  beforeEach(() => {

    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        AppConfigService,
        {provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true},
        {provide: QUEUE_STORAGE_TOKEN},
        AzureQueueService,
        PupilPrefsService,
        TokenService,
        AuditService,
        StorageService,
        { provide: QuestionService, useClass: QuestionServiceMock }
      ]
    });
    azureQueueService = injector.get(AzureQueueService);
    pupilPrefsService = injector.get(PupilPrefsService);
    tokenService = injector.get(TokenService);
    mockQuestionService = injector.get(QuestionService);
    auditService = injector.get(AuditService);
    storageService = injector.get(StorageService);

    storedPrefs = {
      fontSize: 'large',
      contrast: 'yob'
    };
  });

  it('should be created', () => {
    expect(pupilPrefsService).toBeTruthy();
  });

  describe('storePupilPrefs ', () => {
    it('should call pupil prefs azure queue storage', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token', queueName: 'the-queue'});
      const addMessageSpy = spyOn(azureQueueService, 'addMessage');
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getAccessArrangements').and.returnValue(storedPrefs);
      spyOn(storageService, 'getPupil').and.returnValue({ checkCode: 'checkCode' });
      await pupilPrefsService.storePupilPrefs();
      expect(auditService.addEntry).toHaveBeenCalledTimes(2);
      expect(storageService.getAccessArrangements).toHaveBeenCalled();
      expect(storageService.getPupil).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      const payload = {
        preferences: {
          fontSizeCode: 'LRG',
          colourContrastCode: 'YOB'
        },
        checkCode: 'checkCode',
        version: 1
      };
      const retryConfig: IRetryConfig = {
        durationBetweenRetriesMs: pupilPrefsService.pupilPrefsAPIErrorDelay,
        maxRetryCount: pupilPrefsService.pupilPrefsAPIErrorMaxAttempts
      };
      expect(addMessageSpy.calls.all()[0].args[0]).toEqual('the-queue');
      expect(addMessageSpy.calls.all()[0].args[1]).toEqual('url');
      expect(addMessageSpy.calls.all()[0].args[2]).toEqual('token');
      expect(addMessageSpy.calls.all()[0].args[3]).toEqual(payload);
      expect(addMessageSpy.calls.all()[0].args[4]).toEqual(retryConfig);
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallSucceeded');
    });
    it('should audit log the error when azureQueueService add Message fails', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token', queueName: 'the-queue'});
      spyOn(azureQueueService, 'addMessage').and.returnValue(Promise.reject(new Error('error')));
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getAccessArrangements').and.returnValue(storedPrefs);
      spyOn(storageService, 'getPupil').and.returnValue({ checkCode: 'checkCode' });
      await pupilPrefsService.storePupilPrefs();
      expect(storageService.getAccessArrangements).toHaveBeenCalled();
      expect(storageService.getPupil).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(azureQueueService.addMessage).toHaveBeenCalled();
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallFailed');
    });
  });
  describe('loadPupilPrefs', () => {
    it('should load prefs from local storage access_arrangements key and return', () => {
      spyOn(storageService, 'getAccessArrangements').and.returnValue({ contrast: 'bow', fontSize: 'regular' });
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'regular';
      accessArrangements.contrast = 'bow';
      pupilPrefsService.loadPupilPrefs();
      expect(storageService.getAccessArrangements).toHaveBeenCalledTimes(1);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
    it('should load prefs from local storage config key', () => {
      spyOn(storageService, 'getAccessArrangements');
      spyOn(storageService, 'getConfig').and.returnValue({ colourContrastCode: 'BOB', fontSizeCode: 'SML' });
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'small';
      accessArrangements.contrast = 'bob';
      pupilPrefsService.loadPupilPrefs();
      expect(storageService.getAccessArrangements).toHaveBeenCalledTimes(1);
      expect(storageService.getConfig).toHaveBeenCalledTimes(1);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
    it('should provide defaults if local storage does not provide existing values', () => {
      spyOn(storageService, 'getAccessArrangements');
      spyOn(storageService, 'getConfig');
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'regular';
      accessArrangements.contrast = 'bow';
      pupilPrefsService.loadPupilPrefs();
      expect(storageService.getAccessArrangements).toHaveBeenCalledTimes(1);
      expect(storageService.getConfig).toHaveBeenCalledTimes(1);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
  });
});
