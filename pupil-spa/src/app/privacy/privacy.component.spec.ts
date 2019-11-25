import {Component, Input} from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { PrivacyComponent } from './privacy.component';
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

describe('PrivacyComponent', () => {
  let component: PrivacyComponent;
  let fixture: ComponentFixture<PrivacyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]) ],
      declarations: [ PrivacyComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } }, fragment: { subscribe: () => {} } } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrivacyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
