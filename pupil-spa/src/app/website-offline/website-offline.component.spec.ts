import { APP_INITIALIZER, Component } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { WebsiteOfflineComponent } from './website-offline.component'
import { loadConfigMockService } from '../services/config/config.service'

@Component({
    selector: 'app-header',
    template: '',
    standalone: false
})
export class MockAppHeaderComponent {}

@Component({
    selector: 'app-footer',
    template: '',
    standalone: false
})
export class MockAppFooterComponent {}

describe('WebsiteOfflineComponent', () => {
  let component: WebsiteOfflineComponent;
  let fixture: ComponentFixture<WebsiteOfflineComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        WebsiteOfflineComponent,
        MockAppHeaderComponent,
        MockAppFooterComponent
      ],
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true }
      ]
    }).compileComponents()
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WebsiteOfflineComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  });

  it('should create', () => {
    expect(component).toBeTruthy()
  });

  it('should set correct title', () => {
    expect(component.title).toEqual('Multiplication Tables Check')
  });
});
