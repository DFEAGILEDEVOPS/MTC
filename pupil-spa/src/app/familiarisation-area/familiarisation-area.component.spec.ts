import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { AuditService } from '../services/audit/audit.service';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { TokenService } from '../services/token/token.service';

import { FamiliarisationAreaComponent } from './familiarisation-area.component';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';

describe('FamiliarisationAreaComponent', () => {
  let auditService: AuditService;
  let azureQueueService: AzureQueueService;
  let mockRouter;
  let mockStorageService;
  let mockQuestionService;
  let tokenService: TokenService;
  let component: FamiliarisationAreaComponent;
  let fixture: ComponentFixture<FamiliarisationAreaComponent>;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationAreaComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: StorageService, useClass: StorageServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: QUEUE_STORAGE_TOKEN },
        AuditService,
        AzureQueueService,
        TokenService
      ]
    });

    mockStorageService = injector.get(StorageService);
    mockQuestionService = injector.get(QuestionService);
    tokenService = injector.get(TokenService);
    auditService = injector.get(AuditService);
    azureQueueService = injector.get(AzureQueueService);

    spyOn(mockStorageService, 'getItem').and.returnValue({ firstName: 'a', lastName: 'b', checkCode: 'checkCode' });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to colour contrast when enabled', async () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
    await component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice']);
    });
  });

  it('should redirect to the settings page when colour contrast not enabled', async () => {
    spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
    await component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
    });
  });
  describe('When featureUseHpa is enabled', () => {
    beforeEach(() => {
      component.featureUseHpa = true;
    });
    it('should call pupil prefs azure queue storage', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
      spyOn(azureQueueService, 'addMessage');
      spyOn(auditService, 'addEntry');
      await component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
        expect(auditService.addEntry).toHaveBeenCalledTimes(2);
        expect(mockStorageService.getItem).toHaveBeenCalled();
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
      });
    });
    it('should audit log the error when azureQueueService add Message fails', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(tokenService, 'getToken').and.returnValue({url: 'url', token: 'token'});
      spyOn(azureQueueService, 'addMessage').and.returnValue(Promise.reject(new Error('error')));
      const addEntrySpy = spyOn(auditService, 'addEntry');
      await component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
        expect(mockStorageService.getItem).toHaveBeenCalled();
        expect(tokenService.getToken).toHaveBeenCalled();
        expect(azureQueueService.addMessage).toHaveBeenCalled();
        expect(addEntrySpy.calls.all()[1].args[0].type).toEqual('PupilPrefsAPICallFailed');
      });
    });
  });
  describe('when featureHpa is not enabled', () => {
    beforeEach(() => {
      component.featureUseHpa = false;
    });
    it('should not call pupil prefs azure queue storage', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: false });
      spyOn(tokenService, 'getToken');
      spyOn(azureQueueService, 'addMessage');
      spyOn(auditService, 'addEntry');
      await component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
        expect(auditService.addEntry).not.toHaveBeenCalled();
        expect(mockStorageService.getItem).toHaveBeenCalledTimes(1);
        expect(tokenService.getToken).not.toHaveBeenCalled();
        expect(azureQueueService.addMessage).not.toHaveBeenCalled();
      });
    });
  });
});
