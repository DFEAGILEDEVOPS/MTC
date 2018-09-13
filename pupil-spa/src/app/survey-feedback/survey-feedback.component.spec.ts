import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AzureQueueService } from '../services/azure-queue/azure-queue.service';
import { AzureQueueServiceMock } from '../services/azure-queue/azure-queue.service.mock';
import { SurveyFeedbackComponent } from './survey-feedback.component';

describe('SurveyFeedbackComponent', () => {
  let component: SurveyFeedbackComponent;
  let fixture: ComponentFixture<SurveyFeedbackComponent>;
  let mockRouter;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AzureQueueService, useClass: AzureQueueServiceMock },
        FormBuilder,
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFeedbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
