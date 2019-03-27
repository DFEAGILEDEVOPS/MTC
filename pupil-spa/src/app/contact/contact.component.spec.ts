import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import { Component } from '@angular/core';
import { PrivacyComponent } from '../privacy/privacy.component';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ],

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactComponent);
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
