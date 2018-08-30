import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFeedbackThanksComponent } from './survey-feedback-thanks.component';

describe('SurveyFeedbackThanksComponent', () => {
  let component: SurveyFeedbackThanksComponent;
  let fixture: ComponentFixture<SurveyFeedbackThanksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackThanksComponent ]
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
