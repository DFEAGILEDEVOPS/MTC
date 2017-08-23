import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackThanksComponent } from './feedback-thanks.component';

describe('FeedbackThanksComponent', () => {
  let component: FeedbackThanksComponent;
  let fixture: ComponentFixture<FeedbackThanksComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedbackThanksComponent ]
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
