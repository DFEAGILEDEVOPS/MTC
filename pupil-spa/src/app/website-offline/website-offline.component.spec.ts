import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { WebsiteOfflineComponent } from './website-offline.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('WebsiteOfflineComponent', () => {
  let component: WebsiteOfflineComponent;
  let fixture: ComponentFixture<WebsiteOfflineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]) ],
      declarations: [ WebsiteOfflineComponent, MockAppHeaderComponent, MockAppFooterComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { } }, fragment: { subscribe: () => {} } } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteOfflineComponent);
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
  selector: 'app-footer',
  template: ''
})
class MockAppFooterComponent {
}
