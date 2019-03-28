import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AccessibilityStatementComponent } from './accessibility-statement.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('AccessibilityStatementComponent', () => {
  let component: AccessibilityStatementComponent;
  let fixture: ComponentFixture<AccessibilityStatementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]) ],
      declarations: [ AccessibilityStatementComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } }, fragment: { subscribe: () => {} } } }
      ]
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
