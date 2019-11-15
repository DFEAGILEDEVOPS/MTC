import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import {Component, Input} from '@angular/core';

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
class MockAppFooterComponent {
}

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContactComponent, MockAppBreadcrumbsComponent, MockAppHeaderComponent, MockAppFooterComponent ]
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
