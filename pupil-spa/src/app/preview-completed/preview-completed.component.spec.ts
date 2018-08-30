import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewCompletedComponent } from './preview-completed.component';

describe('PreviewCompletedComponent', () => {
  let component: PreviewCompletedComponent;
  let fixture: ComponentFixture<PreviewCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PreviewCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
