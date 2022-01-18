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
import { UserService } from '../services/user/user.service';
import { AuditService } from '../services/audit/audit.service';
import { AppUsageService } from '../services/app-usage/app-usage.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { Config } from '../config.model';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;
  let store: {};
  let mockRouter;
  let appUsageService;
  let questionService;
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
        UserService,
        AuditService,
        QuestionService,
        WindowRefService,
        AppUsageService,
      ]
    });
    storageService = injector.inject(StorageService);
    appUsageService = injector.inject(AppUsageService);
    questionService = injector.inject(QuestionService);
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
    spyOn(questionService, 'getConfig').and.returnValue(new Config());
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
    expect(compiled.querySelector('.notice .aa-copy-size').textContent).toMatch(/Do not press ‘Next’ if this is not you,/);
  });

  describe('for no access arrangements', () => {
    it('should redirect to warm up introduction page', async () => {
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
      });
    });
  });

  describe('for access arrangements', () => {
    it('should redirect to the AA settings page when fontSize is enabled', async () => {
      spyOnProperty(component.config, 'fontSize').and.returnValue(true);
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
      });
    });

    it('should redirect to the AA settings page when audibleSounds is enabled', async () => {
      spyOnProperty(component.config, 'audibleSounds').and.returnValue(true);
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
      });
    });

    it('should redirect to the AA settings page when numpadRemoval is enabled', async () => {
      spyOnProperty(component.config, 'numpadRemoval').and.returnValue(true);
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
      });
    });

    it('should redirect to the AA settings page when questionReader is enabled', async () => {
      spyOnProperty(component.config, 'questionReader').and.returnValue(true);
      component.onClick();
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
      });
    });

    it('should redirect to the AA settings page when inputAssistance is enabled', async () => {
      spyOnProperty(component.config, 'inputAssistance').and.returnValue(true);
      component.onClick();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['access-settings']);
    });

    it('should set modeText to appropriate text when in practice mode', async () => {
      component.config.practice = true;
      const mode = component.modeText;
      expect(mode).toEqual('Try it Out');
    });

    it('should set modeText to appropriate text when in live mode', async () => {
      component.config.practice = false;
      const mode = component.modeText;
      expect(mode).toEqual('Official');
    });
  });
});
