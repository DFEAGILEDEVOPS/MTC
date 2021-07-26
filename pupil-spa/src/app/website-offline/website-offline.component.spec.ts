import { APP_INITIALIZER, Component } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { WebsiteOfflineComponent } from './website-offline.component';
import { RouterTestingModule } from '@angular/router/testing';
import { loadConfigMockService } from '../services/config/config.service'

@Component({
  selector: 'app-header',
  template: ''
})
export class MockAppHeaderComponent {
}

@Component({
  selector: 'app-footer',
  template: ''
})
export class MockAppFooterComponent {
}

fdescribe('WebsiteOfflineComponent', () => {
  let component: WebsiteOfflineComponent;
  let fixture: ComponentFixture<WebsiteOfflineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule.withRoutes([]) ],
      declarations: [ WebsiteOfflineComponent, MockAppHeaderComponent, MockAppFooterComponent ],
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
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
