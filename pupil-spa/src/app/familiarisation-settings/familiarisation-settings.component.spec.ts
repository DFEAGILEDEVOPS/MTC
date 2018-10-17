import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { QuestionService } from '../services/question/question.service';
import { StorageService } from '../services/storage/storage.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';

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

    const injector = TestBed.configureTestingModule({
      declarations: [ FamiliarisationSettingsComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: SpeechService, useClass: SpeechServiceMock },
        StorageService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    storageService = injector.get(StorageService);

    spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamiliarisationSettingsComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to the sign-in-success page on click', () => {
    component.onClick();
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
    });
  });
  it('should have default props', () => {
    expect(component.inputAssistantFirstName.value).toBe('');
    expect(component.inputAssistantLastName.value).toBe('');
  });
  it('should redirect to the sign-in-success page on successful submission', () => {
    spyOn(storageService, 'getItem').and.returnValue({ checkCode: 'checkCode' });
    const setItemSpy = spyOn(storageService, 'setItem');
    component.familiarisationSettingsForm.controls['inputAssistantFirstName'].setValue('F1rstNàme');
    component.familiarisationSettingsForm.controls['inputAssistantLastName'].setValue('Last-Na\'me');
    const updatedPupilData = {
      checkCode: 'checkCode',
      inputAssistant: {
        firstName: 'F1rstNàme',
        lastName: 'Last-Na\'me'
      }
    };
    component.onSubmit('F1rstNàme', 'Last-Na\'me');
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
      expect(storageService.getItem).toHaveBeenCalled();
      expect(setItemSpy.calls.all()[0].args[1]).toEqual(updatedPupilData);
    });
  });
  it('should not redirect to the sign-in-success when a disallowed special character(exclamation) is detected', () => {
    spyOn(storageService, 'getItem');
    spyOn(storageService, 'setItem');
    component.familiarisationSettingsForm.controls['inputAssistantFirstName'].setValue('First!Name');
    component.familiarisationSettingsForm.controls['inputAssistantLastName'].setValue('LastName');
    component.onSubmit('First!Name', 'LastName');
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(storageService.getItem).not.toHaveBeenCalled();
      expect(storageService.setItem).not.toHaveBeenCalled();
    });
  });
  it('should not redirect to the sign-in-success when a disallowed special character(double quotes) is detected', () => {
    spyOn(storageService, 'getItem');
    spyOn(storageService, 'setItem');
    component.familiarisationSettingsForm.controls['inputAssistantFirstName'].setValue('First!Name');
    component.familiarisationSettingsForm.controls['inputAssistantLastName'].setValue('LastName');
    component.onSubmit('First!Name', 'LastName');
    fixture.whenStable().then(() => {
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(storageService.getItem).not.toHaveBeenCalled();
      expect(storageService.setItem).not.toHaveBeenCalled();
    });
  });
});
