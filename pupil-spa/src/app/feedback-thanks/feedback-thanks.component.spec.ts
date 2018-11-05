import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackThanksComponent } from './feedback-thanks.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FeedbackThanksComponent', () => {
  let component: FeedbackThanksComponent;
  let fixture: ComponentFixture<FeedbackThanksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackThanksComponent ],
      schemas: [ NO_ERRORS_SCHEMA ],         // we don't need to test sub-components
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedbackThanksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
