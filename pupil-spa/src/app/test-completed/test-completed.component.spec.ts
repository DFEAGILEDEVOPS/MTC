import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCompletedComponent } from './test-completed.component';

describe('TestCompletedComponent', () => {
  let component: TestCompletedComponent;
  let fixture: ComponentFixture<TestCompletedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestCompletedComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestCompletedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
