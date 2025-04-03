import { TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { WindowRefService } from './services/window-ref/window-ref.service';
import { AppConfigService, loadConfigMockService } from './services/config/config.service';


import { AppComponent } from './app.component';
import { RouteService } from './services/route/route.service';

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        AppConfigService,
        RouteService,
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        WindowRefService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        RouterTestingModule,
      ]
  }).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
