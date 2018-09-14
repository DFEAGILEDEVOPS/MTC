import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { SurveyFeedbackComponent } from './survey-feedback.component';
import { StorageService } from '../services/storage/storage.service';

describe('SurveyFeedbackComponent', () => {
  let component: SurveyFeedbackComponent;
  let fixture: ComponentFixture<SurveyFeedbackComponent>;
  let mockRouter;
  let storageService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackComponent ],
      providers: [
        { provide: Router, useValue: mockRouter },
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

  it('should create', () => {
    component.onSubmit();
    expect(storageService.setItem).toHaveBeenCalledWith('feedback_given', true);
  });
});
