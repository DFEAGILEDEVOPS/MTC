import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyFeedbackComponent } from './survey-feedback.component';

describe('SurveyFeedbackComponent', () => {
  let component: SurveyFeedbackComponent;
  let fixture: ComponentFixture<SurveyFeedbackComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyFeedbackComponent ]
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
