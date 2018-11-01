import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { FormsModule } from '@angular/forms';

import { FamiliarisationSettingsComponent } from './familiarisation-settings.component';

describe('FamiliarisationSettingsComponent', () => {
  let mockRouter;
  let mockQuestionService;
  let component: FamiliarisationSettingsComponent;
  let fixture: ComponentFixture<FamiliarisationSettingsComponent>;
  let storageService: StorageService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockQuestionService = jasmine.createSpyObj('QuestionService', ['getConfig']);

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationSettingsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useValue: mockQuestionService },
        { provide: SpeechService, useClass: SpeechServiceMock },
        StorageService
      ],
      imports: [FormsModule]
    });
    storageService = injector.get(StorageService);
  }));

  describe('With input assistant disabled', () => {

    beforeEach(() => {
      mockQuestionService.getConfig.and.returnValue({ inputAssistance: false });
      fixture = TestBed.createComponent(FamiliarisationSettingsComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should redirect to warm up introduction page', () => {
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
      });
    });
  });

  describe('With input assistant enabled', () => {

    beforeEach(() => {
      mockQuestionService.getConfig.and.returnValue({ inputAssistance: true });
      fixture = TestBed.createComponent(FamiliarisationSettingsComponent);
      fixture.detectChanges();
      component = fixture.componentInstance;
    });

    it('should have empty form data', () => {
      expect(component.inputAssistantForm.value.inputAssistantFirstName).toBe(undefined);
      expect(component.inputAssistantForm.value.inputAssistantLastName).toBe(undefined);
    });

    it('should redirect to the sign-in-success page on successful submission', () => {
      spyOn(storageService, 'getItem').and.returnValue({ checkCode: 'checkCode', inputAssistant: {} });
      const setItemSpy = spyOn(storageService, 'setItem');
      fixture.whenStable().then(() => {
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('F1rstNàme');
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('Last-Na\'me');
        const updatedPupilData = {
          checkCode: 'checkCode',
          inputAssistant: {
            firstName: 'F1rstNàme',
            lastName: 'Last-Na\'me'
          }
        };
        component.onClick();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
        expect(storageService.getItem).toHaveBeenCalled();
        expect(setItemSpy.calls.all()[0].args[1]).toEqual(updatedPupilData);
      });
    });

    it('should not redirect to the sign-in-success when a disallowed special character(exclamation) is detected', () => {
      spyOn(storageService, 'getItem');
      spyOn(storageService, 'setItem');
      fixture.whenStable().then(() => {
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('First!Name');
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('LastName');
        component.onClick();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(storageService.getItem).not.toHaveBeenCalled();
        expect(storageService.setItem).not.toHaveBeenCalled();
      });
    });

    it('should not redirect to the sign-in-success when a disallowed special character(double quotes) is detected', () => {
      spyOn(storageService, 'getItem');
      spyOn(storageService, 'setItem');
      fixture.whenStable().then(() => {
        component.inputAssistantForm.controls.inputAssistantFirstName.setValue('FirstName');
        component.inputAssistantForm.controls.inputAssistantLastName.setValue('Last"Name');
        component.onClick();
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(storageService.getItem).not.toHaveBeenCalled();
        expect(storageService.setItem).not.toHaveBeenCalled();
      });
    });
  });
});
