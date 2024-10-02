import { TestBed } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { AzureQueueService, QueueMessageRetryConfig } from '../azure-queue/azure-queue.service';
import { PupilPrefsService } from './pupil-prefs.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { AppConfigService, loadConfigMockService } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { QuestionService } from '../question/question.service';
import { QuestionServiceMock } from '../question/question.service.mock';
import { AccessArrangements } from '../../access-arrangements';
import { Pupil } from '../../pupil';

let azureQueueServiceSpy: {
  addMessageToQueue: jasmine.Spy
};
let pupilPrefsService: PupilPrefsService;
let auditService: AuditService;
let mockQuestionService;
let tokenService: TokenService;
let storageService: StorageService;
let storedPrefs;

describe('PupilPrefsService', () => {
  beforeEach(() => {
    azureQueueServiceSpy = {
      addMessageToQueue: jasmine.createSpy('addMessageToQueue')
    }
    const injector = TestBed.configureTestingModule({
      imports: [],
      providers: [
        AppConfigService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        PupilPrefsService,
        TokenService,
        AuditService,
        StorageService,
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: AzureQueueService, useValue: azureQueueServiceSpy }
      ]
    });
    pupilPrefsService = injector.inject(PupilPrefsService);
    tokenService = injector.inject(TokenService);
    mockQuestionService = injector.inject(QuestionService);
    auditService = injector.inject(AuditService);
    storageService = injector.inject(StorageService);

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
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getAccessArrangements').and.returnValue(storedPrefs);
      const pupil: Pupil = {
        firstName: 'first',
        firstNameAlias: '',
        lastName: 'last',
        lastNameAlias: '',
        dob: '',
        checkCode: 'checkCode',
        inputAssistant: {
          firstName: 'first',
          lastName: 'last'
        }
      }
      spyOn(storageService, 'getPupil').and.returnValue(pupil);
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
        inputAssistant: pupil.inputAssistant,
        checkCode: 'checkCode',
        version: 2
      };
      const retryConfig: QueueMessageRetryConfig = {
        DelayBetweenRetries: pupilPrefsService.pupilPrefsAPIErrorDelay,
        MaxAttempts: pupilPrefsService.pupilPrefsAPIErrorMaxAttempts
      };
      expect(azureQueueServiceSpy.addMessageToQueue.calls.all()[0].args[0]).toEqual('url');
      expect(azureQueueServiceSpy.addMessageToQueue.calls.all()[0].args[1]).toEqual('token');
      expect(azureQueueServiceSpy.addMessageToQueue.calls.all()[0].args[2]).toEqual(payload);
      expect(azureQueueServiceSpy.addMessageToQueue.calls.all()[0].args[3]).toEqual(retryConfig);
      expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallSucceeded');
    });
    it('should audit log the error when azureQueueService add Message fails', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token', queueName: 'the-queue'});
      azureQueueServiceSpy.addMessageToQueue.and.returnValue(Promise.reject(new Error('error')));
      const addEntrySpy = spyOn(auditService, 'addEntry');
      spyOn(storageService, 'getAccessArrangements').and.returnValue(storedPrefs);
      spyOn(storageService, 'getPupil').and.returnValue({ checkCode: 'checkCode' });
      await pupilPrefsService.storePupilPrefs();
      expect(storageService.getAccessArrangements).toHaveBeenCalled();
      expect(storageService.getPupil).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(azureQueueServiceSpy.addMessageToQueue).toHaveBeenCalled();
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
