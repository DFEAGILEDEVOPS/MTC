import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionPendingComponent } from './submission-pending.component';

describe('SubmissionPendingComponent', () => {
  let component: SubmissionPendingComponent;
  let fixture: ComponentFixture<SubmissionPendingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SubmissionPendingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubmissionPendingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
