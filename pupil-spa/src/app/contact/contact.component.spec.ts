import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import {Component, Input} from '@angular/core';

@Component({
    selector: 'app-header',
    template: '',
    standalone: false
})
export class MockAppHeaderComponent {
}

@Component({
    selector: 'app-breadcrumbs',
    template: '',
    standalone: false
})
export class MockAppBreadcrumbsComponent {
  @Input() breadcrumbs: any[];
}

@Component({
    selector: 'app-footer',
    template: '',
    standalone: false
})
class MockAppFooterComponent {
}

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(waitForAsync(() => {
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
