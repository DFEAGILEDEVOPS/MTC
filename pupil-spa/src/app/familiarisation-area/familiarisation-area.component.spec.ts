import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';

import { AccessArrangements } from '../access-arrangements';
import { AuditService } from '../services/audit/audit.service';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { AzureQueueSubmissionService } from '../services/azure-queue-submission/azure-queue-submission';
import { FamiliarisationAreaComponent } from './familiarisation-area.component';
import { QUEUE_STORAGE_TOKEN } from '../services/azure-queue/azureStorage';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { StorageServiceMock } from '../services/storage/storage.service.mock';
import { TokenService } from '../services/token/token.service';

describe('FamiliarisationAreaComponent', () => {
  let azureQueueSubmissionService: AzureQueueSubmissionService;
  let mockRouter;
  let mockStorageService;
  let mockQuestionService;
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
        AzureQueueSubmissionService,
        TokenService
      ]
    });

    mockStorageService = injector.get(StorageService);
    mockQuestionService = injector.get(QuestionService);
    azureQueueSubmissionService = injector.get(AzureQueueSubmissionService);
  }));

  describe('when config does not include existing font size selection', () => {
    beforeEach(async(() => {
      spyOn(mockStorageService, 'getItem').and.returnValue({firstName: 'a', lastName: 'b', checkCode: 'checkCode'});
      spyOn(mockStorageService, 'setItem');
      fixture = TestBed.createComponent(FamiliarisationAreaComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    it('should expect the component to exist', () => {
      fixture.whenStable().then(() => {
        expect(component).toBeTruthy();
      });
    });

    it('should set the font size to default value (regular) if it is not detected in the config', () => {
      expect(mockStorageService.getItem).toHaveBeenCalledTimes(2);
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'regular';
      expect(mockStorageService.setItem).toHaveBeenCalledWith('access_arrangements', accessArrangements);

    });

    it('should redirect to colour contrast when enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: true});
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
    it('should call pupil prefs azure queue storage', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({colourContrast: false});
      spyOn(azureQueueSubmissionService, 'submitAzureQueueMessage');
      await component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
        expect(mockStorageService.getItem).toHaveBeenCalled();
        expect(azureQueueSubmissionService.submitAzureQueueMessage).toHaveBeenCalled();
        expect(mockStorageService.setItem).toHaveBeenCalled();
      });
    });
  });
  describe('when config includes existing font size selection', () => {
    beforeEach(async(() => {
      spyOn(mockStorageService, 'getItem').and.callFake( (arg) => {
        if (arg === 'pupil') {
          return { firstName: 'a', lastName: 'b', checkCode: 'checkCode' };
        }
        if (arg === 'config') {
          return { fontSizeCode: 'VSM' };
        }
      });
      spyOn(mockStorageService, 'setItem');
      fixture = TestBed.createComponent(FamiliarisationAreaComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    }));
    it('should set the font size in the current component', () => {
      const accessArrangements = new AccessArrangements();
      accessArrangements.fontSize = 'xsmall';
      expect (mockStorageService.setItem.calls.all()[0].args[1]).toEqual(accessArrangements);
    });
  });
});
