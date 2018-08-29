import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { DeviceService } from '../services/device/device.service';
import { LoginSuccessComponent } from './login-success.component';
import * as responseMock from '../login.response.mock.json';
import { StorageService } from '../services/storage/storage.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { UserService } from '../services/user/user.service';
import { AuditService } from '../services/audit/audit.service';
import { AppUsageService } from '../services/app-usage/app-usage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;
  let store: {};
  let mockRouter;
  let appUsageService;
  let storageService;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      imports: [HttpClientModule],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      declarations: [LoginSuccessComponent],
      providers: [
        HttpClient,
        HttpClientModule,
        DeviceService,
        { provide: Router, useValue: mockRouter },
        StorageService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        UserService,
        AuditService,
        WindowRefService,
        AppUsageService
      ]
    });
    storageService = injector.get(StorageService);
    appUsageService = injector.get(AppUsageService);
    injector.compileComponents();

    store = {};

    spyOn(storageService, 'getItem').and.callFake(function (key) {
      return JSON.stringify(responseMock);
    });
    spyOn(storageService, 'setItem').and.callFake(function (key, value) {
      return store[key] = value + '';
    });
    spyOn(storageService, 'clear').and.callFake(function () {
      store = {};
    });
    spyOn(appUsageService, 'increment');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created and remove pupil data', () => {
    expect(component).toBeTruthy();
    expect(appUsageService.increment).toHaveBeenCalledTimes(1);
    expect(storageService.setItem).toHaveBeenCalledTimes(1);
  });

  it('asks the user to confirm their details', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('p.lede').textContent).toMatch(/If this is you, please confirm/);
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
  });

});
