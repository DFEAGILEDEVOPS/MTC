import { TestBed, inject } from '@angular/core/testing';
import { APP_INITIALIZER } from '@angular/core';
import { HttpModule, XHRBackend } from '@angular/http';
import { MockBackend } from '@angular/http/testing';
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
      imports: [HttpModule],
      providers: [
        AppConfigService,
        {provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true},
        {provide: QUEUE_STORAGE_TOKEN},
        AzureQueueService,
        PupilPrefsService,
        TokenService,
        AuditService,
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        {provide: XHRBackend, useClass: MockBackend}
      ]
    });
    azureQueueService = injector.get(AzureQueueService);
    pupilPrefsService = injector.get(PupilPrefsService);
    tokenService = injector.get(TokenService);
    mockQuestionService = injector.get(QuestionService);
    auditService = injector.get(AuditService);
    mockStorageService = injector.get(StorageService);

    pupilPrefsService.featureUseHpa = true;

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
      spyOn(azureQueueService, 'addMessage');
      spyOn(auditService, 'addEntry');
      spyOn(mockStorageService, 'setItem');
      spyOn(mockStorageService, 'getItem').and.returnValue(storedPrefs);
      await pupilPrefsService.storePupilPrefs();
      expect(auditService.addEntry).toHaveBeenCalledTimes(2);
      expect(mockStorageService.getItem).toHaveBeenCalled();
      expect(tokenService.getToken).toHaveBeenCalled();
      expect(azureQueueService.addMessage).toHaveBeenCalled();
    });

    it('should audit log the error when azureQueueService add Message fails', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
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
});
