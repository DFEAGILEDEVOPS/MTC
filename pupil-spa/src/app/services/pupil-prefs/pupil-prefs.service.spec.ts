import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { PupilPrefsService } from './pupil-prefs.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { QUEUE_STORAGE_TOKEN } from '../azure-queue/azureStorage';
import { AuditService } from '../audit/audit.service';
import { QuestionService } from '../question/question.service';
import { QuestionServiceMock } from '../question/question.service.mock';
import { StorageServiceMock } from '../storage/storage.service.mock';
import { AccessArrangements } from '../../access-arrangements';

let azureQueueService: AzureQueueService;
let pupilPrefsService: PupilPrefsService;
let mockStorageService: StorageServiceMock;
let auditService: AuditService;
let mockQuestionService;
let tokenService: TokenService;
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
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock }
      ]
    });
    azureQueueService = injector.get(AzureQueueService);
    pupilPrefsService = injector.get(PupilPrefsService);
    tokenService = injector.get(TokenService);
    mockQuestionService = injector.get(QuestionService);
    auditService = injector.get(AuditService);
    mockStorageService = injector.get(StorageService);

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
      const pupil = { checkCode: 'checkCode' };
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token', queueName: 'the-queue'});
      const addMessageSpy = spyOn(azureQueueService, 'addMessage');
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(mockStorageService, 'setItem');
      spyOn(mockStorageService, 'getItem').and.returnValues(storedPrefs, pupil);
      await pupilPrefsService.storePupilPrefs();
      expect(auditService.addEntry).toHaveBeenCalledTimes(2);
      expect(mockStorageService.getItem).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      const payload = {
        preferences: {
          fontSizeCode: 'LRG',
          colourContrastCode: 'YOB'
        },
        checkCode: 'checkCode',
        version: 1
      };
      const retryConfig = {
        errorDelay: pupilPrefsService.pupilPrefsAPIErrorDelay,
        errorMaxAttempts: pupilPrefsService.pupilPrefsAPIErrorMaxAttempts
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
      spyOn(mockStorageService, 'getItem').and.returnValue(storedPrefs);
      await pupilPrefsService.storePupilPrefs();
      expect(mockStorageService.getItem).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(azureQueueService.addMessage).toHaveBeenCalled();
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallFailed');
    });
  });
  describe('loadPupilPrefs', () => {
    it('should load prefs from local storage access_arrangements key and return', () => {
      spyOn(mockStorageService, 'getItem').and.returnValue({ contrast: 'bow', fontSize: 'regular' });
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'regular';
      accessArrangements.contrast = 'bow';
      pupilPrefsService.loadPupilPrefs();
      expect(mockStorageService.getItem).toHaveBeenCalledTimes(1);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
    it('should load prefs from local storage config key', () => {
      spyOn(mockStorageService, 'getItem').and.returnValues(undefined, { colourContrastCode: 'BOB', fontSizeCode: 'SML' });
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'small';
      accessArrangements.contrast = 'bob';
      pupilPrefsService.loadPupilPrefs();
      expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
    it('should provide defaults if local storage does not provide existing values', () => {
      spyOn(mockStorageService, 'getItem').and.returnValues(undefined, undefined);
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'regular';
      accessArrangements.contrast = 'bow';
      pupilPrefsService.loadPupilPrefs();
      expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
      expect(pupilPrefsService.accessArrangements).toEqual(accessArrangements);
    });
  });
});
