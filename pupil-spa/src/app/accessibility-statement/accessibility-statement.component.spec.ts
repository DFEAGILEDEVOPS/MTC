import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { AccessibilityStatementComponent } from './accessibility-statement.component';
import { RouterTestingModule } from '@angular/router/testing';

@Component({
  selector: 'app-header',
  template: ''
})
export class MockAppHeaderComponent {
}

@Component({
  selector: 'app-breadcrumbs',
  template: ''
})
export class MockAppBreadcrumbsComponent {
  @Input() breadcrumbs: any[];
}

@Component({
  selector: 'app-footer',
  template: ''
})
export class MockAppFooterComponent {
}

describe('AccessibilityStatementComponent', () => {
  let component: AccessibilityStatementComponent;
  let fixture: ComponentFixture<AccessibilityStatementComponent>;

  beforeEach(waitForAsync(() => {
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
