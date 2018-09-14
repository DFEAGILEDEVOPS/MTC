import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { AzureQueueServiceMock } from '../services/azure-queue/azure-queue.service.mock';
import { SurveyFeedbackComponent } from './survey-feedback.component';
import { FeedbackService } from '../services/feedback/feedback.service';
import { StorageService } from '../services/storage/storage.service';

describe('SurveyFeedbackComponent', () => {
  let component: SurveyFeedbackComponent;
  let fixture: ComponentFixture<SurveyFeedbackComponent>;
  let mockRouter;
  let mockFeedbackService;
  let storageService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };
    mockFeedbackService = {
      postSurveyFeedback: jasmine.createSpy('postSurveyFeedback').and.returnValue(Promise.resolve(true))
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AzureQueueService, useClass: AzureQueueServiceMock },
        { provide: FeedbackService, useValue: mockFeedbackService },
        StorageService,
        FormBuilder,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    });
    storageService = injector.get(StorageService);
    injector.compileComponents();
    spyOn(storageService, 'getItem');
    spyOn(storageService, 'setItem');
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit when form is valid', async () => {
    spyOn(component, 'isFormInvalid').and.returnValue(false);

    await component.onSubmit();

    expect(component.isFormInvalid).toHaveBeenCalled();
    expect(storageService.setItem).toHaveBeenCalledWith('feedback_given', true);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['ict-survey/feedback-thanks']);
  });

  it('should not submit when form is invalid', async () => {
    spyOn(component, 'isFormInvalid').and.returnValue(true);

    await component.onSubmit();

    expect(component.isFormInvalid).toHaveBeenCalled();
    expect(storageService.setItem).not.toHaveBeenCalled();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });
});
