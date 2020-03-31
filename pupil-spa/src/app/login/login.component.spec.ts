import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';

import { UserService } from '../services/user/user.service';
import { LoginComponent } from './login.component';
import { Login } from './login.model';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WarmupQuestionService } from '../services/question/warmup-question.service';
import { CheckStatusServiceMock } from '../services/check-status/check-status.service.mock';
import { CheckStatusService } from '../services/check-status/check-status.service';
import { APP_INITIALIZER, NO_ERRORS_SCHEMA } from '@angular/core';
import { PupilPrefsService } from '../services/pupil-prefs/pupil-prefs.service';
import { LoginErrorService } from '../services/login-error/login-error.service';
import { LoginErrorDiagnosticsService } from '../services/login-error-diagnostics/login-error-diagnostics.service';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { loadConfigMockService } from '../services/config/config.service';
import { DeviceService } from '../services/device/device.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockRouter;
  let mockUserService;
  let promiseHelper;
  let mockQuestionService;
  let storageService;
  let mockWarmupQuestionService;
  let mockCheckStatusService;
  let mockPupilPrefsService;
  let mockLoginModel;
  let hasUnfinishedCheckSpy;
  let loginErrorService;
  let loginErrorDiagnosticsService;
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let windowRefService: WindowRefService;

  beforeEach(async(() => {
    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    mockUserService = {
      login: function () {
        return undefined;
      }
    };

    mockPupilPrefsService = {
      loadPupilPrefs: jasmine.createSpy('loadPupilPrefs')
    };

    const loginPromise = new Promise((resolve, reject) => {
      promiseHelper = {
        resolve,
        reject
      };
    });

    spyOn(mockUserService, 'login').and.returnValue(loginPromise);

    const injector = TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [FormsModule, HttpClientTestingModule],
      schemas: [ NO_ERRORS_SCHEMA ], // we don't need to test sub-components
      providers: [
        { provide: APP_INITIALIZER, useFactory: loadConfigMockService, multi: true },
        { provide: Login, useValue: mockLoginModel },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter },
        { provide: QuestionService, useClass: QuestionServiceMock },
        { provide: WarmupQuestionService, useClass: QuestionServiceMock },
        { provide: CheckStatusService, useClass: CheckStatusServiceMock },
        { provide: PupilPrefsService, useValue: mockPupilPrefsService },
        DeviceService,
        LoginErrorService,
        LoginErrorDiagnosticsService,
        StorageService,
        WindowRefService
      ]
    });
    mockQuestionService = injector.get(QuestionService);
    mockWarmupQuestionService = injector.get(WarmupQuestionService);
    mockLoginModel = injector.get(Login);
    mockCheckStatusService = injector.get(CheckStatusService);
    mockPupilPrefsService = injector.get(PupilPrefsService);
    loginErrorService = injector.get(LoginErrorService);
    loginErrorDiagnosticsService = injector.get(LoginErrorDiagnosticsService);
    httpClient = TestBed.get(HttpClient);
    httpTestingController = TestBed.get(HttpTestingController);
    storageService = TestBed.get(StorageService);
    windowRefService = injector.get(WindowRefService);

    spyOn(mockQuestionService, 'initialise');
    spyOn(mockWarmupQuestionService, 'initialise');
    spyOn(loginErrorService, 'changeMessage');
    hasUnfinishedCheckSpy = spyOn(mockCheckStatusService, 'hasUnfinishedCheck');
    hasUnfinishedCheckSpy.and.returnValue(false);
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should render schoolPin and pupil pin input boxes', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#schoolPin')).toBeTruthy();
    expect(compiled.querySelector('#pupilPin')).toBeTruthy();
  });

  describe('before login submission', () => {
    it('should set loginPending to false', async () => {
      expect(component.loginPending).toBeFalsy();
    });
  });

  describe('during login submission', () => {
    it('should set the loginPending to true', async () => {
      component.onSubmit('goodPin', 'goodPin');
      expect(component.loginPending).toBeTruthy();
    });
  });

  describe('on successful login', () => {
    beforeEach(() => {
      promiseHelper.resolve({ success: 'login okay' });
    });

    it('should set the loginPending to false', async () => {
      await component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(component.loginPending).toBeFalsy();
      });
    });

    it('should initialise the QuestionService and WarmupQuestionService on login', async () => {
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockWarmupQuestionService.initialise).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should prevent a second submit', async () => {
      component.onSubmit('goodPin', 'goodPin');
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalled();
        expect(mockUserService.login).toHaveBeenCalledTimes(1);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to success page given a valid schoolPin and pupilPin', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({});
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-success']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the font selection page when fontSize is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ fontSize: true });
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockQuestionService.getConfig).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['font-choice']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });

    it('should redirect to the colour contrast page when colourContrast is enabled', async () => {
      spyOn(mockQuestionService, 'getConfig').and.returnValue({ colourContrast: true });
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(mockQuestionService.getConfig).toHaveBeenCalled();
        expect(mockRouter.navigate).toHaveBeenCalledWith(['colour-choice']);
        expect(mockPupilPrefsService.loadPupilPrefs).toHaveBeenCalled();
      });
    });
  });

  describe('should fail logging in when PIN(s) are invalid', () => {
    beforeEach(() => {
      promiseHelper.reject({ message: 'login failed', status: 401 });
    });

    it('changes the loginPending to be false', async () => {
      await component.onSubmit('badPin', 'badPin');
      fixture.whenStable().then(() => {
        expect(component.loginPending).toBeFalsy();
      });
    });

    it('redirects to login page when the school and pupil pin credentials are rejected', async () => {
      component.onSubmit('badPin', 'badPin');
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('login failed');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in']);
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
      });
    });
  });
  describe('redirects to sign in fail page when there is no connection', () => {
    beforeEach(() => {
      promiseHelper.reject({ message: 'no connection', status: 0 });
    });

    it('redirects to an error page when the connection fails', async () => {
      spyOn(loginErrorDiagnosticsService, 'process');
      component.onSubmit('goodPin', 'goodPin');
      fixture.whenStable().then(() => {
        expect(loginErrorService.changeMessage).toHaveBeenCalledWith('no connection');
        expect(mockRouter.navigate).toHaveBeenCalledWith(['sign-in-fail']);
        expect(mockPupilPrefsService.loadPupilPrefs).not.toHaveBeenCalled();
        expect(loginErrorDiagnosticsService.process).toHaveBeenCalled();
      });
    });
  });
  describe('ngOnInit', () => {
    it('should set the loginPending to false', async () => {
      component.ngOnInit();
      expect(component.loginPending).toBeFalsy();
    });
    it('should navigate to check path with query params if an unfinished check is detected', () => {
      hasUnfinishedCheckSpy.and.returnValue(true);
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['check'], { queryParams: { unfinishedCheck: true } });
    });
    it('should not navigate to check path if a completed check is detected', () => {
      component.ngOnInit();
      expect(mockRouter.navigate).toHaveBeenCalledTimes(0);
    });
  });
});
