import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyWelcomeComponent } from './survey-welcome.component';

describe('SurveyWelcomeComponent', () => {
  let component: SurveyWelcomeComponent;
  let fixture: ComponentFixture<SurveyWelcomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SurveyWelcomeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveyWelcomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
