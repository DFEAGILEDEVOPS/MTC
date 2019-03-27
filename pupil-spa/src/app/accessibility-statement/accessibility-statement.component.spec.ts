import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessibilityStatementComponent } from './accessibility-statement.component';
import { Component } from '@angular/core';

describe('AccessibilityStatementComponent', () => {
  let component: AccessibilityStatementComponent;
  let fixture: ComponentFixture<AccessibilityStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccessibilityStatementComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccessibilityStatementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

@Component({
  selector: 'app-header',
  template: ''
})
class MockAppHeaderComponent {
}

@Component({
  selector: 'app-breadcrumbs',
  template: '',
  inputs: ['breadcrumbs']
})
class MockAppBreadcrumbsComponent {
}

@Component({
  selector: 'app-footer',
  template: ''
})
class MockAppFooterComponent {
}
