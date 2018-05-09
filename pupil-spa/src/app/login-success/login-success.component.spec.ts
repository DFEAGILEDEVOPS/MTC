import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { AuditService } from '../services/audit/audit.service';
import { AppCountService } from '../services/app-count/app-count.service';

describe('LoginSuccessComponent', () => {
  let component: LoginSuccessComponent;
  let fixture: ComponentFixture<LoginSuccessComponent>;
  let store: {};
  let mockRouter;
  let appCountService;

  beforeEach(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    const injector = TestBed.configureTestingModule({
      declarations: [LoginSuccessComponent],
      providers: [
        DeviceService,
        { provide: Router, useValue: mockRouter },
        StorageService,
        { provide: SpeechService, useClass: SpeechServiceMock },
        { provide: QuestionService, useClass: QuestionServiceMock },
        AuditService,
        WindowRefService,
        AppCountService
      ]
    });
    const storageService = injector.get(StorageService);
    appCountService = injector.get(AppCountService);
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
    spyOn(appCountService, 'increment');
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
    expect(appCountService.increment).toHaveBeenCalledTimes(1);
  });

  it('asks the user to confirm their details', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('p.lede').textContent).toMatch(/Check your details are correct/);
  });

  it('redirects to warm up introduction page', () => {
    component.onClick();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['check-start']);
  });

});
