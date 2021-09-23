import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TestErrorComponent } from './test-error.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  template: ''
})
export class MockAppHeaderComponent {
}

describe('TestErrorComponent', () => {
  let component: TestErrorComponent;
  let fixture: ComponentFixture<TestErrorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TestErrorComponent, MockAppHeaderComponent ]
    })
    .compileComponents();
  }));

  it('should create', () => {
    try {
      fixture = TestBed.createComponent(TestErrorComponent);
      component = fixture.componentInstance;
      component.ngOnInit();
      fail('expected to throw');
    } catch (error) {
      expect(error).toMatch('Pupil SPA Front end test error');
    }
  });
});
