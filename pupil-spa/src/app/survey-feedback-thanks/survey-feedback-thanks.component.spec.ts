import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { SurveyFeedbackThanksComponent } from './survey-feedback-thanks.component';
import { StorageService } from '../services/storage/storage.service';

describe('SurveyFeedbackThanksComponent', () => {
  let component: SurveyFeedbackThanksComponent;
  let fixture: ComponentFixture<SurveyFeedbackThanksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackThanksComponent ],
      providers: [
        StorageService,
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: {
            get: () => {
              return 'true';
            }
          } } }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyFeedbackThanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
